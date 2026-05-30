from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('vendeur', 'Vendeur'),
        ('client', 'Client'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='client')
    
    # We will use name to map Mongoose name
    name = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Shop(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    owner_name = models.CharField(max_length=255, blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shops')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=255)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    stock = models.IntegerField(default=0)
    image = CloudinaryField('image', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('airtel', 'Airtel Money'),
        ('mpesa', 'M-Pesa'),
        ('orange', 'Orange Money'),
        ('visa', 'Carte Visa'),
        ('cash', 'Cash'),
    )
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('paid', 'Payé'),
        ('failed', 'Échoué'),
        ('shipped', 'Expédié'),
        ('delivered', 'Livré'),
    )
    total = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='orders')
    commission = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    shipping_address = models.TextField()
    phone = models.CharField(max_length=50)
    is_read_by_vendor = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} for {self.shop.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    product_image = models.CharField(max_length=500, blank=True, null=True)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=255)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"
