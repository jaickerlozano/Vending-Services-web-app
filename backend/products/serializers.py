from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    margin = serializers.SerializerMethodField()
    margin_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'type', 'type_machine', 'supplier',
            'cost', 'price', 'margin', 'margin_percentage',
            'created_at', 'updated_at'
        ]
    
    def get_margin(self, obj):
        """Calcula margen en dinero"""
        return float(obj.price - obj.cost)
    
    def get_margin_percentage(self, obj):
        """Calcula porcentaje de margen"""
        if obj.price == 0:
            return 0
        return round(float((obj.price - obj.cost) / obj.price * 100), 2)
