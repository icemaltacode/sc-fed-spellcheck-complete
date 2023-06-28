import { useId, useState, useEffect, memo, useCallback } from 'react';
import './App.css';

const apiKey = process.env.REACT_APP_BING_API_KEY;
const apiEndpoint = process.env.REACT_APP_BING_API_ENDPOINT;

async function fetchSuggestions(text) {
  if (text === "") return [];

  const params = new URLSearchParams({
    mkt: 'en-us',
    mode: 'proof',
    text: text
  });
  const response = await fetch(apiEndpoint + '?' + params, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Ocp-Apim-Subscription-Key': apiKey
    }
  });
  const json = await response.json();
  return json;
}

function SpellcheckInput({ setCurrentText }) {
  const textAreaId = useId();
  
  const handleTextChanged = (evt) => {
    if (evt.code === "Space") {
      setCurrentText(evt.target.value);
    }
  };

  return <>
    <textarea 
      spellCheck={false}
      className="form-control" 
      rows={5} 
      id={textAreaId} 
      onKeyDown={(evt) => handleTextChanged(evt)}  
     />
  </>
}

const SpellcheckOutput = memo(({ checkResult }) => {
  return (checkResult && checkResult.flaggedTokens && checkResult.flaggedTokens.length > 0 ? <>
    <table className='table'>
      <thead>
        <tr>
          <th scope="col">Possible Error</th>
          <th scope="col">Suggestions</th>
        </tr>
      </thead>
      <tbody>
        {checkResult.flaggedTokens.map((flaggedToken, i) => <tr key={i}>
          <th scope='row'>{flaggedToken.token}</th>
          <td>{flaggedToken.suggestions.map(s => s.suggestion).join(', ')}</td>
        </tr>)}
      </tbody>
    </table>
  </> : null)
});

function SpellChecker() {
  const [currentText, setCurrentText] = useState(""); 
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    load();

    async function load() {
      const res = await fetchSuggestions(currentText);
      setSuggestions(res);
    }
  }, [currentText])

  return <div>
    <small className="text-muted">Type text below to have it analysed.</small>
    <SpellcheckInput setCurrentText={setCurrentText} />
    <SpellcheckOutput checkResult={suggestions}/>
  </div>
}

function App() {
  return <div className='container'>
    <div className='rounded-container'>
      <h3>SpellChecker</h3>
      <hr />
      <SpellChecker />
    </div>
  </div>
}

export default App;
