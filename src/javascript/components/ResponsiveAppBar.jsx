import * as React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

const pages = {
  Home: '/',
  About: '/about',
  Contact: '/contact',
  Games: '/games',
};
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" style={{
      paddingTop: '.5em',
      paddingBottom: '.5em',
      boxShadow: 'none',
      borderBottom: '1px dashed #cccccc80',
      backgroundColor: 'transparent',
      color: '#27273e',
    }}>
      <Container>
        <Toolbar disableGutters>
        <Box
          component="img"
          sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
          style={{ width: '3.4em', marginRight: '.5em' }}
          alt="ChessXcel Logo"
          src="/images/icon.svg"
        />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              fontSize: '1.5em',
              color: '#27273e',
              textDecoration: 'none',
            }}
          >
            ChessXcel
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {Object.keys(pages).map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Link to={pages[page]} style={{ textDecoration: 'none', color: '#27273e' }}>
                    <Typography textAlign="center" style={{ color: '#27273e' }}>{page}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box
            component="img"
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            style={{ width: '3.4em', marginRight: '.5em' }}
            alt="ChessXcel Logo"
            src="/images/icon.svg"
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '1.5em',
            }}
          >
            ChessXcel
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {Object.keys(pages).map((page) => (
            <MenuItem key={page} onClick={handleCloseNavMenu}>
                <Link to={pages[page]} style={{ textDecoration: 'none', color: '#27273e' }}>
                <Typography textAlign="center" style={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '.4px' }}>{page}</Typography>
                </Link>
            </MenuItem>
          ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center" style={{ color: '#27273e' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
