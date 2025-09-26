import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../App';

const styles = {
  // Main container for the content. Removed 100vw/100vh/backgroundColor
  mainContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // We rely on the App.jsx wrapper for full screen layout
    padding: '20px',
  },
  // The content box should be white
  contentBox: {
    padding: '40px',
    backgroundColor: '#fff', 
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
    width: '90%',
    maxWidth: '1100px', // INCREASED SIZE
    textAlign: 'center',
    color: '#333',
  },
  welcome: { color: '#666', fontSize: '1.2em' },
  title: { color: '#333', marginTop: '5px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#333',
  },
  optionsContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  optionInput: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#333',
  },
  removeButton: {
    width: '30px',
    height: '30px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.2em',
  },
  addButton: {
    padding: '10px 15px',
    border: '1px solid #007bff',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#007bff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  submitButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
  },
  closeButton: {
    marginTop: '15px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
  },
  resultsContainer: {
    marginTop: '30px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  resultsTitle: {
    color: '#333',
    marginBottom: '15px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  resultOption: { fontWeight: 'bold', color: '#333' },
  resultCount: { color: '#007bff' },
};

function TeacherDashboard() {
  const teacherName = useSelector(state => state.user.name);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [pollResults, setPollResults] = useState({});
  const [isPollActive, setIsPollActive] = useState(false);

  useEffect(() => {
    socket.on('vote_received', (results) => {
      console.log('Real-time results received:', results);
      setPollResults(results);
    });

    socket.on('poll_closed', () => {
      setIsPollActive(false);
      setQuestion('');
      setOptions(['', '', '']);
      setPollResults({});
      console.log('Poll has been closed.');
    });

    return () => {
      socket.off('vote_received');
      socket.off('poll_closed');
    };
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmitPoll = (e) => {
    e.preventDefault();
    
    const filteredOptions = options.filter(opt => opt.trim() !== '');

    if (!question.trim() || filteredOptions.length < 2) {
      console.log('Please enter a question and at least two options.');
      return;
    }

    const newPoll = {
      id: Date.now(),
      question,
      options: filteredOptions,
    };

    socket.emit('create_poll', newPoll);
    
    // Do not clear the form immediately, let the user see the poll they started
    setPollResults({});
    setIsPollActive(true);
  };

  const handleClosePoll = () => {
    socket.emit('close_poll');
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.contentBox}>
        <h2 style={styles.welcome}>Hello, {teacherName}!</h2>
        <h1 style={styles.title}>Create a New Poll</h1>
        
        <form onSubmit={handleSubmitPoll} style={styles.form}>
          <input
            type="text"
            placeholder="Enter your poll question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            style={styles.input}
            disabled={isPollActive}
          />
          <div style={styles.optionsContainer}>
            {options.map((option, index) => (
              <div key={index} style={styles.optionRow}>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                  style={styles.optionInput}
                  disabled={isPollActive}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => handleRemoveOption(index)} style={styles.removeButton} disabled={isPollActive}>
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddOption} style={styles.addButton} disabled={isPollActive}>
            Add Another Option
          </button>
          <button type="submit" style={styles.submitButton} disabled={isPollActive}>
            Start Poll
          </button>
        </form>
        
        {isPollActive && (
          <button onClick={handleClosePoll} style={styles.closeButton}>
            Close Poll
          </button>
        )}

        {Object.keys(pollResults).length > 0 && (
          <div style={styles.resultsContainer}>
            <h3 style={styles.resultsTitle}>Live Poll Results</h3>
            {Object.keys(pollResults).map((option) => (
              <div key={option} style={styles.resultItem}>
                <span style={styles.resultOption}>{option}:</span>
                <span style={styles.resultCount}>{pollResults[option]} votes</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
