import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import UserIdentification from './components/UserIdentification';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPollView from './components/StudentPollView';
import './App.css';

// IMPORTANT: Socket connection remains the same
const SOCKET_SERVER_URL = "https://live-poll-backend-rhcj.onrender.com";
export const socket = io(SOCKET_SERVER_URL, { 
  reconnectionAttempts: 5
}); 

const appStyles = {
  // This wrapper ensures the whole app fills the screen, 
  // uses the flex layout for centering, and is bright white.
  appWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // We rely on html/body/root CSS (App.css) for 100% width/height
    minHeight: '100vh', 
    width: '100%',
    backgroundColor: '#fff', // Force background to white here
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  }
};

function App() {
  const user = useSelector(state => state.user);
  const isIdentified = user.isIdentified;

  useEffect(() => {
    socket.on('connect', () => {
      console.log('App: Socket Connected!');
    });

    socket.on('disconnect', () => {
      console.log('App: Socket Disconnected!');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  let content;

  if (!isIdentified) {
    content = <UserIdentification />;
  } else if (user.role === 'Teacher') {
    content = <TeacherDashboard />;
  } else {
    content = <StudentPollView />;
  }

  return (
    <div style={appStyles.appWrapper}>
      {content}
    </div>
  );
}

export default App;
