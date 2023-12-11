
class TestProfile:
    """Test for profile gateway"""

    def test_MyProfile(self, socket_main_A):
        socket_main_A.emit('MyProfile')
        assert True

    def test_Profile(self, socket_main_A):
        socket_main_A.emit('Profile', data=('sasha',))
        socket_main_A.emit('Profile', data=('doesnt-exist',))
        socket_main_A.emit('Profile', data=('doesnt-exist', 123))
        socket_main_A.emit('Profile', data=(123,))
        socket_main_A.emit('Profile')
        assert True