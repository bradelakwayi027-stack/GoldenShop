from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register', views.register_view, name='register'),
    path('auth/login', views.login_view, name='login'),
    path('auth/logout', views.logout_view, name='logout'),
    path('auth/me', views.current_user_view, name='current_user'),

    # Shops
    path('shops', views.shop_list_create, name='shops'),
    path('shops/pending', views.pending_shops_view, name='pending_shops'),
    path('shops/<int:pk>/approve', views.approve_shop_view, name='approve_shop'),
    path('shops/<int:pk>', views.shop_detail_view, name='shop_detail'),

    # Products
    path('products', views.product_list_create, name='products'),
    path('products/shop/<int:shop_id>', views.products_by_shop_view, name='products_by_shop'),
    path('products/my', views.my_products_view, name='my_products'),
    path('products/<int:pk>', views.product_detail_view, name='product_detail'),

    # Orders
    path('orders', views.order_list_create, name='orders'),
    path('orders/vendor', views.vendor_orders_view, name='vendor_orders'),
    path('orders/admin', views.admin_orders_view, name='admin_orders'),
    path('orders/mine', views.my_orders_view, name='my_orders'),
    path('orders/<int:pk>', views.delete_order_view, name='delete_order'),
    path('orders/<int:pk>/read-vendor', views.mark_order_read_view, name='mark_order_read'),

    # Messages
    path('messages/admin/send', views.admin_send_message_view, name='admin_send_message'),
    path('messages/vendor', views.vendor_messages_view, name='vendor_messages_list'),
    path('messages/<int:pk>/read', views.mark_message_read_view, name='mark_message_read'),

    # Payment (Flexpay)
    path('payment/flexpay/initiate', views.flexpay_initiate_view, name='flexpay_initiate'),
    
    # Payment (PayPal)
    path('payment/paypal/create', views.paypal_create_order, name='paypal_create'),
    path('payment/paypal/capture', views.paypal_capture_order, name='paypal_capture'),

    # Users
    path('users', views.user_list_view, name='users'),
]
