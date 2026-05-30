from rest_framework import serializers
from .models import User, Shop, Product, Order, OrderItem, Message

class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'role']
        read_only_fields = ['id']


class ShopSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    owner = UserSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='owner', write_only=True, required=False
    )
    
    class Meta:
        model = Shop
        fields = ['id', 'name', 'description', 'owner_name', 'owner', 'owner_id', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), source='shop', write_only=True
    )
    image = serializers.ImageField(required=False, allow_null=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'shop', 'shop_id', 'created_by', 'stock', 'image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', required=False, allow_null=True
    )
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'product_image', 'quantity', 'price']
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    user = UserSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.PrimaryKeyRelatedField(
        queryset=Shop.objects.all(), source='shop', write_only=True
    )
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'items', 'total', 'currency', 'payment_method', 'status', 
            'user', 'shop', 'shop_id', 'commission', 'shipping_address', 'phone', 
            'is_read_by_vendor', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'commission', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate 5% commission based on total
        total = validated_data.get('total')
        validated_data['commission'] = float(total) * 0.05
        
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order


class MessageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='recipient', write_only=True
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'recipient_id', 'subject', 'content', 'is_read', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at', 'updated_at']
