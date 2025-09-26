import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { socket } from '../App';

const styles = {
  // Container for the content. We remove 100vw/100vh from here 
  // and let the App.jsx wrapper handle the full screen layout.
  mainContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // Removed 100vw/100vh/backgroundColor
    boxSizing: 'border-box',
    padding: '20px',
  },
  // The white content box
  contentBox: {
    width: '90%',
    maxWidth: '1100px',
    padding: '40px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
  title: { fontSize: '2.5em', color: '#333' },
  subtitle: { color: '#666', marginBottom: '40px', fontSize: '1.2em' },
  buttonGroup: { display: 'flex', gap: '40px', justifyContent: 'center', width: '100%' },
  roleButton: {
    flex: 1,
    padding: '50px',
    cursor: 'pointer',
    border: '2px solid #ddd',
    borderRadius: '16px',
    backgroundColor: 'white',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    color: '#333',
  },
  roleButtonActive: {
    flex: 1,
    padding: '50px',
    cursor: 'pointer',
    border: '2px solid #6c5ce7',
    borderRadius: '16px',
    backgroundColor: 'white',
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
    transform: 'scale(1.03)',
    color: '#6c5ce7',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonText: { fontSize: '1.5em', marginBottom: '10px', fontWeight: 'bold' },
  buttonDescription: { color: '#666', fontSize: '1em', lineHeight: '1.4' },
  continueButton: {
    marginTop: '40px',
    padding: '18px 50px',
    fontSize: '1.3em',
    border: 'none',
    borderRadius: '30px',
    backgroundColor: '#6c5ce7',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  input: {
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '18px',
    width: '80%',
    margin: '30px auto',
    backgroundColor: 'white',
    color: '#333'
  },
  centeredContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  }
};

function UserIdentification() {
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setShowNameInput(false);
  };

  const handleContinue = () => {
    if (role) {
      setShowNameInput(true);
    } else {
      // Use console.log instead of alert
      console.log('Please select a role.');
    }
  };

  const handleStart = () => {
    if (name.trim()) {
      dispatch(setUser({ role, name: name.trim() }));
      socket.emit('user_identified', { role, name: name.trim(), id: socket.id });
    } else {
      // Use console.log instead of alert
      console.log('Please enter your name.');
    }
  };

  if (showNameInput) {
    return (
      <div style={styles.mainContainer}>
        <div style={styles.contentBox}>
          <h1 style={styles.title}>Let's Get Started</h1>
          <p style={styles.subtitle}>
            If you're a student, you'll be able to **submit your answers** and see how your responses compare with your classmates.
          </p>
          <div style={styles.centeredContent}>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleStart();
              }}
            />
            <button onClick={handleStart} style={styles.continueButton}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentBox}>
        <h1 style={styles.title}>Welcome to the Live Polling System</h1>
        <p style={styles.subtitle}>
          Please select the role that best describes you to begin using the live polling system.
        </p>
        <div style={styles.buttonGroup}>
          <div
            onClick={() => handleRoleSelect('Student')}
            style={role === 'Student' ? styles.roleButtonActive : styles.roleButton}
          >
            <p style={styles.buttonText}>I'm a Student</p>
            <p style={styles.buttonDescription}>
              I will be submitting answers to questions created by the teacher.
            </p>
          </div>
          <div
            onClick={() => handleRoleSelect('Teacher')}
            style={role === 'Teacher' ? styles.roleButtonActive : styles.roleButton}
          >
            <p style={styles.buttonText}>I'm a Teacher</p>
            <p style={styles.buttonDescription}>
              I will be submitting questions and viewing live poll results in real-time.
            </p>
          </div>
        </div>
        <button onClick={handleContinue} style={{ ...styles.continueButton, opacity: role ? 1 : 0.5 }} disabled={!role}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default UserIdentification;
