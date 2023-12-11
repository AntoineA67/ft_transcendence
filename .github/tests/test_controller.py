
import pytest
import requests


SIGNIN = "http://pongpong.me/api/auth/signin"
PROFILE = "http://pongpong.me/api/profile"
CHATS = "http://pongpong.me/api/chats"
USERS = "http://pongpong.me/api/users"

class TestController:
    """Test for controllers"""


    """Test for profile"""

    def test_my_profile(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{PROFILE}/me", headers=header)
        assert res.status_code == 200

    def test_sasha_profile(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{PROFILE}/sasha", headers=header)
        assert res.status_code == 200

    def test_noone_profile(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{PROFILE}/123qweasd", headers=header)
        assert res.status_code == 404

    """Test for Chat"""
    
    def test_random_chat(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{CHATS}/123qweasd", headers=header)
        assert res.status_code == 404

    def test_not_allowed_chat(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{CHATS}/1", headers=header)
        assert res.status_code == 404

    def test_badurl_chat(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{CHATS}/-1", headers=header)
        assert res.status_code == 404

    """Test for users"""

    def test_get_all_users(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{USERS}/all", headers=header)
        assert res.status_code == 200

    def test_non_exist_route(self, token_A):
        header = {'Authorization': f"Bearer {token_A}"}
        res = requests.get(f"{USERS}/-1", headers=header)
        assert res.status_code == 404

