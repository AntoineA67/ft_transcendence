import { Button } from 'react-bootstrap';
import { Card } from 'react-bootstrap';
import CloseButton from 'react-bootstrap/CloseButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';



function Login() {
	return (
		<div>
			<CloseButton></CloseButton>
			<ButtonGroup aria-label="Basic example">
				<Button ></Button>
				<Button variant="primary">Left</Button>
				<Button variant="secondary">Right</Button>
			</ButtonGroup>
			<Card>hello</Card>
			<Form>
				<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
					<Form.Label>Email address</Form.Label>
					<Form.Control type="email" placeholder="name@example.com" />
				</Form.Group>
				<Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
					<Form.Label>Example textarea</Form.Label>
					<Form.Control as="textarea" rows={3} />
				</Form.Group>
			</Form>
		</div>
	);
}

export default Login;