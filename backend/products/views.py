from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['get'])
    def options(self, request):
        """Devuelve opciones de tipos y máquinas desde el modelo"""
        return Response({
            'types': [
                {'label': label, 'value': value} 
                for value, label in Product.TYPE
            ],
            'machines': [
                {'label': label, 'value': value} 
                for value, label in Product.TYPE_MACHINE
            ]
        })