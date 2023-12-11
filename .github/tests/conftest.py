import pytest
import requests
import socketio

HOME = "http://pongpong.me"
SIGNIN = "http://pongpong.me/api/auth/signin"


@pytest.fixture(scope="session")
def token_A():
    """
    Generate access token for test user.
    If the state of the user is modified, the test may fail.
    """
    user = {
        "email": "testA@gmail.com",
        "password": "Pa$$word123",
        "token2FA": ""
    }
    res = requests.post(SIGNIN, json=user)
    data = res.json()
    yield data['token']
    pass


@pytest.fixture(scope="session")
def token_B():
    """
    Generate access token for test user.
    If the state of the user is modified, the test may fail.
    """
    user = {
        "email": "testB@gmail.com",
        "password": "Pa$$word123",
        "token2FA": ""
    }
    res = requests.post(SIGNIN, json=user)
    data = res.json()
    yield data['token']
    pass

@pytest.fixture(scope="session")
def socket_main_A(token_A):
    socket = socketio.SimpleClient()
    socket.connect(HOME, auth={ 'token': token_A })
    yield socket
    socket.disconnect()

@pytest.fixture(scope="session")
def socket_social_A(token_A):
    
    socket = socketio.SimpleClient()
    socket.connect(HOME, auth={ 'token': token_A }, namespace='/friends')
    yield socket
    socket.disconnect()

