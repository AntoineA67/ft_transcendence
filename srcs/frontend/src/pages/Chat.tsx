import '../styles/ProfileSetting.css';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import eyeopen from '../assets/eyeopen.svg';
import eyeclose from '../assets/eyeclose.svg';
import { Link, Outlet } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { ListGroup, Image } from 'react-bootstrap';

const users = [
	{ id: 1, username: 'user1', avatar: 'url_de_l_avatar'},
	{ id: 2, username: 'user2', avatar: 'url_de_l_avatar'},
  ];



export function Chat() {
	return (
		<>
   <Container>
      <Row>
        <Col md={4}>
          <ListGroup>
            {users.map((user) => (
              <ListGroup.Item key={user.id} className="d-flex align-items-center">
                <Image src={user.avatar} roundedCircle className="mr-2" width={40} height={40} />
                {user.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={8}>
          {/* Contenu de la page principale */}
        </Col>
      </Row>
    </Container>
		</>
	)
}