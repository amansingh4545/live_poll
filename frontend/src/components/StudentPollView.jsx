import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../App';

const styles = {
  // Main container: Centers content vertically on the screen
  mainContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh', 
    width: '100%',
    padding: '20px',
  },
  // The content box: Now allows internal scrolling (overflowY) if the content is long
  contentBox: {
    padding: '40px',
    backgroundColor: '#fff', 
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
    width: '95%', 
    maxWidth: '700px', // Setting a clear max-width for the card
    maxHeight: '80vh', // Ensures the card doesn't exceed screen height
    overflowY: 'auto', // IMPORTANT: Allows vertical scrolling inside the card
    textAlign: 'center',
    color: '#333', 
  },
  title: { fontSize: '2.5em', color: '#333' },
  waitingText: { fontSize: '1.2em' },
  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid #ccc',
    borderTop: '3px solid #6c5ce7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '10px',
  },
  question: { color: '#444', marginBottom: '20px', fontSize: '1.8em' },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginTop: '20px',
  },
  optionButton: {
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #6c5ce7',
    backgroundColor: '#fff',
    color: '#6c5ce7',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.2s',
  },
  votedButton: {
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    color: '#999',
    cursor: 'not-allowed',
    transition: 'background-color 0.3s',
  },
  votedMessage: {
    marginTop: '20px',
    color: 'green',
    fontWeight: 'bold',
  },
  closedMessage: {
    marginTop: '20px',
    color: 'red',
    fontWeight: 'bold',
  },
};

function StudentPollView() {
  const studentName = useSelector(state => state.user.name);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [isPollActive, setIsPollActive] = useState(false);

  useEffect(() => {
    socket.on('new_poll', (pollData) => {
      console.log('New poll received:', pollData);
      setCurrentPoll(pollData);
      setVoted(false);
      setIsPollActive(true);
    });

    socket.on('poll_closed', () => {
      setIsPollActive(false);
      setCurrentPoll(null); 
      console.log('Poll has been closed.');
    });

    return () => {
      socket.off('new_poll');
      socket.off('poll_closed');
    };
  }, []);

  const handleVote = (optionIndex) => {
    if (voted || !isPollActive) return;

    if (!currentPoll || !currentPoll.options || optionIndex >= currentPoll.options.length) {
        console.error("Invalid poll or option index when attempting to vote.");
        return;
    }

    // This is where the socket event is emitted that crashes the server
    socket.emit('submit_vote', {
      pollId: currentPoll.id,
      voterId: socket.id,
      votedOption: currentPoll.options[optionIndex]
    });

    setVoted(true); 
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentBox}>
        {!currentPoll || !isPollActive ? (
          <div>
            <h1 style={styles.title}>Hello, {studentName}!</h1>
            <p style={styles.waitingText}>
              <span style={styles.spinner}></span>
              Waiting for the teacher to start a poll...
            </p>
            {!isPollActive && currentPoll && (
                <p style={styles.closedMessage}>The last poll has ended. Waiting for a new one.</p>
            )}
          </div>
        ) : (
          <div>
            <h1 style={styles.title}>Question for you, {studentName}!</h1>
            <h2 style={styles.question}>{currentPoll.question}</h2>
            <div style={styles.optionsContainer}>
              {currentPoll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  disabled={voted || !isPollActive}
                  style={(voted || !isPollActive) ? styles.votedButton : styles.optionButton}
                >
                  {option}
                </button>
              ))}
            </div>
            {voted && <p style={styles.votedMessage}>Your vote has been submitted!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPollView;
