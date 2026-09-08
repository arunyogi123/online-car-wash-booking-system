import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

KHALTI_SECRET_KEY = os.getenv("KHALTI_SECRET_KEY")


class KhaltiPay:

    @staticmethod
    def get_initial_id(**data):

        url = "https://dev.khalti.com/api/v2/epayment/initiate/"

        service = data.get("service")

        service_detail = [
            {
                "identity": str(service.id),
                "name": service.service_name,
                "total_price": int(service.price * 100),
                "quantity": 1,
                "unit_price": int(service.price * 100),
            }
        ]

        payload = {
            "return_url": "http://127.0.0.1:8000/api/payment/callback/",
            "website_url": "http://127.0.0.1:8000/",
            "amount": int(data.get("amount")),
            "purchase_order_id": str(data.get("order_id")),
            "purchase_order_name": data.get("order_name"),
            "customer_info": {
                "name": data.get("name"),
                "phone": data.get("phone"),
            },
            "product_details": service_detail,
        }

        headers = {
            "Authorization": f"Key {KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.post(
            url,
            headers=headers,
            data=json.dumps(payload),
        )

        return response.json()

    @staticmethod
    def verify_payment(pidx):

        url = "https://dev.khalti.com/api/v2/epayment/lookup/"

        payload = {
            "pidx": pidx
        }

        headers = {
            "Authorization": f"Key {KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.post(
            url,
            headers=headers,
            data=json.dumps(payload),
        )

        return response.json()