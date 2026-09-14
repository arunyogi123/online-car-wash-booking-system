import os
import json
import requests
from dotenv import load_dotenv

#load environment variables from .env file
load_dotenv()

# Get the Khalti secret key from environment variables
KHALTI_SECRET_KEY = os.getenv("KHALTI_SECRET_KEY")


class KhaltiPay:

    @staticmethod
    def get_initial_id(**data):

        url = "https://dev.khalti.com/api/v2/epayment/initiate/"

        #extract service details that willl be in kwargs
        service = data.get("service")

        service_detail = [
            {
                #unique identity for the service being purchased
                "identity": str(service.id),
                #Display name of the service being purchased
                "name": service.service_name,
                #price in paisa (1 rupee = 100 paisa)
                "total_price": int(service.price * 100),
                #quantity of the service being purchased
                "quantity": 1,
                #unit price in paisa (1 rupee = 100 paisa)
                "unit_price": int(service.price * 100),
            }
        ]
        #the actual payload/data that will be sent to the Khalti API for payment initiation
        payload = {
            #the URL to which the user will be redirected after the payment is completed
            "return_url": "http://127.0.0.1:8000/api/payment/callback/",
            #our website URL, this is required by Khalti for verification purposes
            "website_url": "http://127.0.0.1:8000/",
            #the amount to be paid in paisa (1 rupee = 100 paisa)
            "amount": int(data.get("amount")),
            #the unique order ID for the purchase, this should be unique for each transaction
            "purchase_order_id": str(data.get("order_id")),
            #the name of the order, this can be any string that describes the order
            "purchase_order_name": data.get("order_name"),
            
            "customer_info": {
                "name": data.get("name"),
                "phone": data.get("phone"),
            },
            #the list of products/services being purchased, this is a list of dictionaries where each dictionary contains the details of a product/service
            "product_details": service_detail,
        }

        #extra info about the request, this is required by Khalti for verification purposes
        headers = {
            #the authorization header that contains the Khalti secret key, this is required for authentication with the Khalti API
            "Authorization": f"Key {KHALTI_SECRET_KEY}",

            #khalti expects in json format 
            "Content-Type": "application/json",
        }

        response = requests.post(
            #where to send  the request, this is the Khalti API endpoint for payment initiation
            url,
            #attach our headers and payload to the request, this is required for authentication and to send the necessary data to the Khalti API
            headers=headers,

            #converts pythin string in json because khalti expects in json format
            data=json.dumps(payload),
        )
        #turn it into pyhon dictionary and return it to the caller, this is the response from the Khalti API which contains the initial payment ID and other details about the payment
        return response.json()

    @staticmethod
    #This method is used to verify the payment made by the user. 
    def verify_payment(pidx):
        #khalti checks the payment status using the unique payment ID (pidx) that was returned by the Khalti API during the payment initiation process.
        url = "https://dev.khalti.com/api/v2/epayment/lookup/"

        payload = {
            #payment ID khalti gave us ,to verify payment status
            "pidx": pidx
        }

        headers = {
            #so our secret key so khalti can verify us 
            "Authorization": f"Key {KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }


        response = requests.post(
            url,
            headers=headers,
            #send the payload to khalti in json format
            data=json.dumps(payload),
        )

        return response.json()