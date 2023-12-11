 

class TestSocial:
    """Test on block, friend, friendRequest gateways"""
    """
    These tests doesn't check the return value.
    They just send a bunch of stuff via socket. 
    If the server survive then it's good.
    """

    """Block gateway"""

    def test_findAllBlocks(self, socket_social_A):
        socket_social_A.emit('findAllBlocks')
        assert True

    def test_block(self, socket_social_A):
        socket_social_A.emit('block', data=(100,))
        socket_social_A.emit('block', data=(-100,))
        socket_social_A.emit('block', data=(0,))
        socket_social_A.emit('block', data=(1,))
        assert True

    def test_unblock(self, socket_social_A):
        socket_social_A.emit('unblock', data=(100,))
        socket_social_A.emit('unblock', data=(-100,))
        socket_social_A.emit('unblock', data=(0,))
        socket_social_A.emit('unblock', data=(1,))
        assert True

    """Friend gateway"""
    def test_findAllFriends(self, socket_social_A):
        socket_social_A.emit('findAllFriends')
        socket_social_A.emit('findAllFriends', data=('hi',))
        assert True

    def test_isFriend(self, socket_social_A):
        socket_social_A.emit('isFriend')
        socket_social_A.emit('isFriend', data=(-100,))
        socket_social_A.emit('isFriend', data=(0,))
        socket_social_A.emit('isFriend', data=(1,))
        socket_social_A.emit('isFriend', data=(100,))
        socket_social_A.emit('isFriend', data=('hello',))
        assert True

    def test_Unfriend(self, socket_social_A):
        socket_social_A.emit('Unfriend')
        socket_social_A.emit('Unfriend', data=(-100,))
        socket_social_A.emit('Unfriend', data=(0,))
        socket_social_A.emit('Unfriend', data=(1,))
        socket_social_A.emit('Unfriend', data=(100,))
        socket_social_A.emit('Unfriend', data=('hello',))
        assert True

    def test_findOthers(self, socket_social_A):
        socket_social_A.emit('findOthers')
        socket_social_A.emit('findOthers', data=('hi',))
        assert True
        
    """Test Friend Request"""
    def test_findAllReqs(self, socket_social_A):
        socket_social_A.emit('findAllReqs')
        socket_social_A.emit('findAllReqs', data=('hi',))
        assert True
    
    def test_sendReq(self, socket_social_A):
        socket_social_A.emit('sendReq')
        socket_social_A.emit('sendReq', data=(1,))
        socket_social_A.emit('sendReq', data=('hello',))
        socket_social_A.emit('sendReq', data=('sasha',))
        assert True
    
    def test_replyReq(self, socket_social_A):
        socket_social_A.emit('replyReq', data=(123, True))
        socket_social_A.emit('replyReq', data=(123, False))
        socket_social_A.emit('replyReq')
        socket_social_A.emit('replyReq', data=('hello', True))
        socket_social_A.emit('replyReq', data=('hello', False))
        socket_social_A.emit('replyReq', data=('sasha', True))
        socket_social_A.emit('replyReq', data=('sasha', False))
        assert True

    def test_reqSent(self, socket_social_A):
        socket_social_A.emit('reqSent', data=(-100,))
        socket_social_A.emit('reqSent', data=(0,))
        socket_social_A.emit('reqSent', data=(1,))
        socket_social_A.emit('reqSent', data=(100,))
        socket_social_A.emit('reqSent', data=('hello',))
        assert True