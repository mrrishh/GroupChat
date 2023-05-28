import unittest
import requests
import json

class APIFunctionalTests(unittest.TestCase):
    def setUp(self):
        with open('test_json.json') as file:
            self.collection = json.load(file)


    def test_get_request(self):
        for request in self.collection['item']:
            if request['request']['method'] == 'GET':
                # Extract request details
                url = request['request']['url']['raw']
                headers = request['request']['header']
                if isinstance(headers, list):
                    headers = {header['key']: header['value'] for header in headers}
                # Print method and URL
                print(f"GET Request: {url}")
                
                # Send the GET request
                response = requests.get(url, headers=headers)

                # Assert response status code and other validations
                self.assertEqual(response.status_code, 200)
                # Add more assertions or validations as per your API response

    def test_post_request(self):
        for request in self.collection['item']:
            if request['request']['method'] == 'POST':
                # Extract request details
                url = request['request']['url']['raw']
                headers = request['request']['header']
                if isinstance(headers, list):
                    headers = {header['key']: header['value'] for header in headers if header['key'].strip()}
                body = request['request']['body']['raw']

                # Print method and URL
                print(f"GET Request: {url}")
                # Send the POST request
                response = requests.post(url, headers=headers, data=body)

                # Assert response status code and other validations
                self.assertEqual(response.status_code, 200)
                # Add more assertions or validations as per your API response


    def test_delete_request(self):
        for request in self.collection['item']:
            if request['request']['method'] == 'DELETE':
                # Extract request details
                url = request['request']['url']['raw']
                headers = request['request']['header']
                if isinstance(headers, list):
                    headers = {header['key']: header['value'] for header in headers}

                # Print method and URL
                print(f"GET Request: {url}")
                # Send the DELETE request
                response = requests.delete(url, headers=headers)

                # Assert response status code and other validations
                self.assertEqual(response.status_code, 200)
                # Add more assertions or validations as per your API response

if __name__ == '__main__':
    unittest.main()
