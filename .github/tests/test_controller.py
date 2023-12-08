
import pytest
import requests


SIGNIN = "http://pongpong.me/api/auth/signin"
PROFILE = "http://pongpong.me/api/profile"
CHATS = "http://pongpong.me/api/chats"
USERS = "http://pongpong.me/api/users"

class TestController:
    """
    test controller
    """
    @pytest.fixture(scope="class")
    def access_token(self):
        """
        Generate access token for test user.
        If the state of the user is modified, the test may fail.
        """
        
        user = {
            "email": "test@gmail.com",
            "password": "Pa$$word123",
            "token2FA": ""
        }
        res = requests.post(SIGNIN, json=user)
        data = res.json()
        yield data['token']
        pass


    """Test for profile"""

    def test_my_profile(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{PROFILE}/me", headers=header)
        assert res.status_code == 200

    def test_sasha_profile(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{PROFILE}/sasha", headers=header)
        assert res.status_code == 200

    def test_noone_profile(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{PROFILE}/123qweasd", headers=header)
        assert res.status_code == 404

    """Test for Chat"""
    
    def test_random_chat(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{CHATS}/123qweasd", headers=header)
        assert res.status_code == 404

    def test_not_allowed_chat(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{CHATS}/1", headers=header)
        assert res.status_code == 404

    def test_badurl_chat(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{CHATS}/-1", headers=header)
        assert res.status_code == 404

    """Test for users"""

    def test_get_all_users(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{USERS}/all", headers=header)
        assert res.status_code == 200

    def test_non_exist_route(self, access_token):
        header = {'Authorization': f"Bearer {access_token}"}
        res = requests.get(f"{USERS}/-1", headers=header)
        assert res.status_code == 404

