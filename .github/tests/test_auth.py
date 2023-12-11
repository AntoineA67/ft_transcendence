
import requests

SIGNUP = "http://pongpong.me/api/auth/signup"

class TestAuth:
    """
    Try to create users with bad input
    """
    
    def test_bad_password_1(self):
        """
        password with only number
        """
        body = {
            "username": "123qweasd",
            "email": "hello@gmail.com",
            "password": "123456789",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400

        
    def test_bad_password_2(self):
        """
        password with only alpha
        """
        body = {
            "username": "123qweasd",
            "email": "hello@gmail.com",
            "password": "abcdefghijk",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400

       
    def test_bad_password_3(self):
        """
        password with no uppercase
        """
        body = {
            "username": "testetst",
            "email": "hello@gmail.com",
            "password": "123456qweasd",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400
        
        
    def test_bad_password_4(self):
        """
        password with no special chararcter
        """
        body = {
            "username": "123ABCdefg",
            "email": "hello@gmail.com",
            "password": "123456Abcdee",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400
        
        
    def test_missing_username(self):
        body = {
            "email": "hello@gmail.com",
            "password": "123456Abcdee@",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400
        
    def test_missing_email(self):
        body = {
           "username": "123ABCdefg",
            "password": "123456Abcdee@",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400
        
    def test_missing_password(self):
        body = {
            "username": "123ABCdefg",
            "email": "hello@gmail.com",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400
        
    def test_bad_email(self):
        body = {
            "username": "123ABCdefg",
            "email": "hellogmail.com",
            "password": "@123456Abcdee",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400
        
    def test_bad_email(self):
        body = {
            "username": "123ABCdefg",
            "email": "hello@gmail",
            "password": "@123456Abcdee",
        }
        res = requests.post(SIGNUP, json=body)
        assert res.status_code == 400



