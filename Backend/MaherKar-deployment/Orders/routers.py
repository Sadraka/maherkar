from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionOrderViewSet


class SubscriptionOrderRouter(DefaultRouter):

    def __init__(self):
        super().__init__()
        self.register(r'', SubscriptionOrderViewSet,
                      basename='SubscriptionOrder')

    def get_urls(self):
        custom_urls = [
            path('', include([
                path('', SubscriptionOrderViewSet.as_view(
                    {'get': 'list', 'post': 'create'}), name='subscriptionorder-list-create'),
                path('new-job/', SubscriptionOrderViewSet.as_view(
                    {'post': 'create_new_job_order'}), name='subscriptionorder-new-job'),
                path('<uuid:id>/', SubscriptionOrderViewSet.as_view(
                    {'get': 'retrieve'}), name='subscriptionorder-retrieve'),
            ])),
        ]
        return custom_urls
