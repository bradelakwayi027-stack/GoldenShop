import os
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, authentication_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import User, Shop, Product, Order, OrderItem, Message
from .serializers import (
    UserSerializer, ShopSerializer, ProductSerializer, 
    OrderSerializer, MessageSerializer
)

# --- AUTHENTICATION VIEWS ---

@api_view(['POST'])
@authentication_classes([])  # No auth check = no DRF CSRF enforcement on register
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'client')

    if not email or not password or not name:
        return Response({'message': 'Veuillez fournir toutes les informations nécessaires', 'error': 'Veuillez fournir toutes les informations nécessaires'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'message': 'Cet email est déjà utilisé', 'error': 'Cet email est déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

    # Use email prefix as username
    username = email.split('@')[0]
    # Handle duplicates in username just in case
    orig_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{orig_username}{counter}"
        counter += 1

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        name=name,
        role=role
    )

    token, _ = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    return Response({
        'user': serializer.data,
        'token': token.key
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])  # No auth check = no DRF CSRF enforcement on login
@permission_classes([AllowAny])
@ensure_csrf_cookie
@csrf_exempt
def login_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({'message': 'Veuillez fournir un email et un mot de passe', 'error': 'Veuillez fournir un email et un mot de passe'}, status=status.HTTP_400_BAD_REQUEST)

    user_obj = User.objects.filter(email=email).first()
    if not user_obj:
        return Response({'message': 'Identifiants invalides', 'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(request, username=user_obj.username, password=password)
    if user is not None:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Identifiants invalides', 'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)


from django.views.decorators.csrf import ensure_csrf_cookie

@api_view(['GET'])
@ensure_csrf_cookie
def current_user_view(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)
    return Response({'user': None}, status=status.HTTP_200_OK)


# --- SHOP VIEWS ---

@api_view(['GET', 'POST'])
def shop_list_create(request):
    if request.method == 'GET':
        shops = Shop.objects.all().order_by('-created_at')
        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'message': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
            
        data = request.data.copy()
        serializer = ShopSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_shops_view(request):
    if request.user.role != 'admin':
        return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
    shops = Shop.objects.filter(is_approved=False).order_by('-created_at')
    serializer = ShopSerializer(shops, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def approve_shop_view(request, pk):
    if request.user.role != 'admin':
        return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
    try:
        shop = Shop.objects.get(pk=pk)
        shop.is_approved = True
        shop.save()
        serializer = ShopSerializer(shop)
        return Response(serializer.data)
    except Shop.DoesNotExist:
        return Response({'message': 'Boutique introuvable'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def shop_detail_view(request, pk):
    try:
        shop = Shop.objects.get(pk=pk)
    except Shop.DoesNotExist:
        return Response({'message': 'Boutique introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        if shop.owner != request.user and request.user.role != 'admin':
            return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ShopSerializer(shop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if request.user.role != 'admin' and shop.owner != request.user:
            return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
        shop.delete()
        return Response({'message': 'Boutique supprimée'})



# --- PRODUCT VIEWS ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def product_list_create(request):
    if request.method == 'GET':
        # Get all products from approved shops
        products = Product.objects.filter(shop__is_approved=True).order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'message': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            # Check shop ownership
            shop = serializer.validated_data['shop']
            if shop.owner != request.user:
                return Response({'message': 'Vous n\'êtes pas le propriétaire de cette boutique'}, status=status.HTTP_403_FORBIDDEN)
            if not shop.is_approved:
                return Response({'message': 'Votre boutique n\'est pas encore approuvée'}, status=status.HTTP_400_BAD_REQUEST)
                
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def products_by_shop_view(request, shop_id):
    products = Product.objects.filter(shop_id=shop_id).order_by('-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_products_view(request):
    products = Product.objects.filter(created_by=request.user).order_by('-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail_view(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'message': 'Produit introuvable'}, status=status.HTTP_404_NOT_FOUND)

    if product.created_by != request.user and request.user.role != 'admin':
        return Response({'message': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Produit supprimé'})


# --- ORDER VIEWS ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_list_create(request):
    if request.method == 'POST':
        data = request.data.copy()
        serializer = OrderSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_orders_view(request):
    # Find orders for shops owned by the user
    my_shops = Shop.objects.filter(owner=request.user)
    orders = Order.objects.filter(shop__in=my_shops).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_view(request):
    if request.user.role != 'admin':
        return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
        
    orders = Order.objects.all().order_by('-created_at')
    # Calculate sum of commissions
    total_commission = Order.objects.aggregate(total=Sum('commission'))['total'] or 0.0
    
    serializer = OrderSerializer(orders, many=True)
    return Response({
        'orders': serializer.data,
        'totalCommission': total_commission
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_view(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_order_view(request, pk):
    try:
        order = Order.objects.get(pk=pk)
        
        # Check permissions: order creator, shop owner or admin
        if (order.user != request.user and 
            order.shop.owner != request.user and 
            request.user.role != 'admin'):
            return Response({'message': 'Action non autorisée'}, status=status.HTTP_403_FORBIDDEN)
            
        order.delete()
        return Response({'message': 'Commande supprimée'})
    except Order.DoesNotExist:
        return Response({'message': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_order_read_view(request, pk):
    try:
        order = Order.objects.get(pk=pk)
        if order.shop.owner != request.user:
            return Response({'message': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        order.is_read_by_vendor = True
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'message': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)


# --- MESSAGE VIEWS ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_send_message_view(request):
    if request.user.role != 'admin':
        return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
        
    data = request.data
    serializer = MessageSerializer(data=data)
    if serializer.is_valid():
        serializer.save(sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_messages_view(request):
    messages = Message.objects.filter(recipient=request.user).order_by('-created_at')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_message_read_view(request, pk):
    try:
        msg = Message.objects.get(pk=pk)
        if msg.recipient != request.user:
            return Response({'message': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        msg.is_read = True
        msg.save()
        serializer = MessageSerializer(msg)
        return Response(serializer.data)
    except Message.DoesNotExist:
        return Response({'message': 'Message introuvable'}, status=status.HTTP_404_NOT_FOUND)


# --- PAYMENT (FLEXPAY) VIEWS ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flexpay_initiate_view(request):
    data = request.data
    amount = float(data.get('amount', 0))
    currency = data.get('currency', 'USD')
    customer_phone = data.get('customerPhone')
    payment_method = data.get('paymentMethod')

    # Simulation split payment 95% vendeur, 5% admin
    commission_admin = amount * 0.05
    part_vendeur = amount * 0.95
    merchant_phone = '+243998311952'

    print(f"[FLEXPAY DJANGO] Initiation paiement de {amount} {currency} via {payment_method}")
    print(f"[FLEXPAY DJANGO] Répartition : Admin (5%) = {commission_admin}, Vendeur (95%) = {part_vendeur}")
    print(f"[FLEXPAY DJANGO] Numéro Marchand : {merchant_phone}")
    print(f"[FLEXPAY DJANGO] Numéro Client : {customer_phone}")

    # Simulated delay of 2 seconds
    import time
    time.sleep(2)

    transaction_reference = f"FLEX-DJANGO-{int(time.time())}"

    return Response({
        'success': True,
        'message': 'Paiement initié avec succès',
        'reference': transaction_reference,
        'status': 'pending_validation_client'
    }, status=status.HTTP_200_OK)


# --- USERS VIEWS (For admin panel) ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list_view(request):
    if request.user.role != 'admin':
        return Response({'message': 'Accès refusé'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# --- PAYPAL PAYMENT VIEWS ---

import requests
import json

def get_paypal_access_token():
    client_id = os.environ.get('PAYPAL_CLIENT_ID')
    client_secret = os.environ.get('PAYPAL_CLIENT_SECRET')
    if not client_id or not client_secret:
        return None
        
    mode = os.environ.get('PAYPAL_MODE', 'sandbox')
    base_url = 'https://api-m.paypal.com' if mode == 'live' else 'https://api-m.sandbox.paypal.com'
    
    url = f"{base_url}/v1/oauth2/token"
    headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
    }
    data = {'grant_type': 'client_credentials'}
    
    try:
        response = requests.post(url, headers=headers, data=data, auth=(client_id, client_secret), timeout=10)
        if response.status_code == 200:
            return response.json().get('access_token')
    except Exception as e:
        print(f"[PAYPAL] Error getting access token: {e}")
    return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def paypal_create_order(request):
    data = request.data
    amount = float(data.get('amount', 0))
    shop_id = data.get('shop_id')
    
    try:
        shop = Shop.objects.get(pk=shop_id)
    except Shop.DoesNotExist:
        return Response({'message': 'Boutique introuvable'}, status=status.HTTP_404_NOT_FOUND)
        
    commission_admin = round(amount * 0.05, 2)
    part_vendeur = round(amount * 0.95, 2)
    
    access_token = get_paypal_access_token()
    if access_token:
        mode = os.environ.get('PAYPAL_MODE', 'sandbox')
        base_url = 'https://api-m.paypal.com' if mode == 'live' else 'https://api-m.sandbox.paypal.com'
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}',
        }
        
        vendor_paypal_email = shop.paypal_email or os.environ.get('PAYPAL_CLIENT_EMAIL')
        admin_paypal_email = os.environ.get('PAYPAL_CLIENT_EMAIL', 'admin@my-ecommerce.com')
        
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{amount:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": "USD",
                                "value": f"{amount:.2f}"
                            }
                        }
                    }
                }
            ]
        }
        
        if shop.paypal_email:
            payload["purchase_units"][0]["payee"] = {
                "email_address": shop.paypal_email
            }
            payload["purchase_units"][0]["payment_instruction"] = {
                "disbursement_mode": "INSTANT",
                "platform_fees": [
                    {
                        "amount": {
                            "currency_code": "USD",
                            "value": f"{commission_admin:.2f}"
                        },
                        "payee": {
                            "email_address": admin_paypal_email
                        }
                    }
                ]
            }
        
        try:
            res = requests.post(f"{base_url}/v2/checkout/orders", headers=headers, data=json.dumps(payload), timeout=10)
            if res.status_code in [200, 201]:
                return Response(res.json(), status=status.HTTP_200_OK)
            else:
                print(f"[PAYPAL] Partner checkout failed ({res.status_code}): {res.text}. Falling back to standard checkout.")
                fallback_payload = {
                    "intent": "CAPTURE",
                    "purchase_units": [
                        {
                            "amount": {
                                "currency_code": "USD",
                                "value": f"{amount:.2f}"
                            },
                            "description": f"Achat Boutique {shop.name}"
                        }
                    ]
                }
                res_fallback = requests.post(f"{base_url}/v2/checkout/orders", headers=headers, data=json.dumps(fallback_payload), timeout=10)
                if res_fallback.status_code in [200, 201]:
                    return Response(res_fallback.json(), status=status.HTTP_200_OK)
                return Response(res_fallback.json(), status=res_fallback.status_code)
        except Exception as e:
            return Response({'message': f'Erreur de communication avec PayPal: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    else:
        # Simulation Mode
        import time
        simulated_order_id = f"PAYPAL-SIM-{int(time.time())}"
        print(f"[PAYPAL SIMULATION] Création de commande: Total={amount}$, Vendeur ({shop.name})={part_vendeur}$, Commission (5%)={commission_admin}$")
        return Response({
            'id': simulated_order_id,
            'status': 'CREATED',
            'simulated': True,
            'links': [
                {
                    'href': '#simulated-approve',
                    'rel': 'approve',
                    'method': 'GET'
                }
            ]
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def paypal_capture_order(request):
    data = request.data
    paypal_order_id = data.get('order_id')
    is_simulated = data.get('simulated', False)
    
    if not paypal_order_id:
        return Response({'message': 'Order ID requis'}, status=status.HTTP_400_BAD_REQUEST)
        
    if is_simulated or paypal_order_id.startswith('PAYPAL-SIM'):
        return Response({
            'status': 'COMPLETED',
            'simulated': True,
            'message': 'Paiement simulé avec succès'
        }, status=status.HTTP_200_OK)
        
    access_token = get_paypal_access_token()
    if not access_token:
        return Response({'message': 'Identifiants PayPal non disponibles pour la capture'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    mode = os.environ.get('PAYPAL_MODE', 'sandbox')
    base_url = 'https://api-m.paypal.com' if mode == 'live' else 'https://api-m.sandbox.paypal.com'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}',
    }
    
    try:
        res = requests.post(f"{base_url}/v2/checkout/orders/{paypal_order_id}/capture", headers=headers, timeout=10)
        if res.status_code in [200, 201]:
            return Response(res.json(), status=status.HTTP_200_OK)
        return Response(res.json(), status=res.status_code)
    except Exception as e:
        return Response({'message': f'Erreur lors de la capture de l\'ordre PayPal: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

