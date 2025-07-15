import { useId, useState, useEffect, memo } from 'react';
import './App.css';

async function fetchSuggestions(text) {
  if (text.trim() === "") return null;

  const params = new URLSearchParams({
    text: text,
    language: import.meta.env.VITE_LANGUAGE
  });

  const response = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
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
  return (checkResult && checkResult.matches && checkResult.matches.length > 0 ? <>
    <table className='table'>
      <thead>
        <tr>
          <th scope="col">Issue</th>
          <th scope="col">Suggestions</th>
        </tr>
      </thead>
      <tbody>
        {checkResult.matches.map((match, i) => (
          <tr key={i}>
            <th scope='row'>{match.context.text.substring(match.context.offset, match.context.offset + match.length)}</th>
            <td>{match.replacements.map(r => r.value).join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </> : null);
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
