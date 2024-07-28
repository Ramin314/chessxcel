import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, ThemeProvider, createTheme } from '@mui/material';
import { GlobalProvider } from './GlobalContext.jsx';
import Home from './Home.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import CreateGame from './games/CreateGame.jsx';
import Games from './games/Games.jsx';
import EditGame from './games/EditGame.jsx';

import ResponsiveAppBar from '../components/ResponsiveAppBar.jsx';
import Footer from '../components/Footer.jsx';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  palette: {
    primary: {
      main: '#27273e',
    },
    secondary: {
      main: '#635bff',
      contrastText: '#fff',
    },
    typography: {
      allVariants: {
        color: '#27273e',
      },
    },
    success: {
      light: '#635bff',
      main: '#635bff',
      dark: '#635bff',
    },
    error: {
      light: '#ff0000',
      main: '#ff0000',
      dark: '#ff0000',
    },
  },
});

const App = () => (
  <GlobalProvider>
    <ThemeProvider theme={theme}>
      <Router>
        <ResponsiveAppBar />
        <Container>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/create" element={<CreateGame />} />
            <Route path="/games/:id/edit" element={<EditGame />} /> {/* Add this route */}
            <Route path="/tags" element={<></>} />
          </Routes>
        </Container>
      </Router>
      <Footer />
    </ThemeProvider>
  </GlobalProvider>
);

export default App;
