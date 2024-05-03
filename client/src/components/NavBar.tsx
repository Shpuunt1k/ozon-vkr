import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

const NavBar: FC = () => {
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
                <Container>
                    <Navbar.Brand href="/">Домой</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            {/* <Nav.Link as={NavLink} to="/stocks">Остатки</Nav.Link> */}
                            <Nav.Link as={NavLink} to="/supply">Список товаров</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default NavBar;
