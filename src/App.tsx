import ReactTooltip from 'react-tooltip';
import './App.css';
import Text from './example.json'

const Diff = require("diff");

interface TranscriptionWord {
  confidence: string,
  content: string
}

interface TranscriptionItem {
  start_time?: string | undefined,
  end_time?: string,
  alternatives: TranscriptionWord[],
  type: string,
  language_code?: string|undefined
}

const Reference = "The United Kingdom"+
"England, Scotland, Wales and Northern Ireland are parts of the United"+
"Kingdom (UK). London is the capital city. English is the official language."+
"Great Britain is the island with England, Wales and Scotland."+
"Edinburgh is the capital city of Scotland. A famous landmark in Edinburgh"+
"is Edinburgh Castle."+
"Stirling is a city in Scotland. A famous landmark in Stirling is the William"+
"Wallace Monument."+
"London is the capital city of England. A famous landmark in London is the"+
"Palace of Westminster."+
"Bath is a city in England. A famous landmark in Bath is the ancient Roman"+
"Spa."+
"Cardiff is the capital city of Wales. A famous landmark in Cardiff is the"+
"Millennium Stadium."+
"Bangor is a city in Wales. A famous landmark in Bangor is the Menai Straits"+
"Bridge."+
"Belfast is the capital city of Northern Ireland. A famous landmark in Belfast"+
"is the Albert Clock."+
"Derry is a city in Northern Ireland. A famous landmark in Derry is the old"+
"City Wall."

const diff = Diff.diffChars(Reference, Text.results.transcripts[0].transcript);

function App() {
  const Words:TranscriptionItem []= (Text.results.items)
  const render = getTranscription(Words)

  return (
    <div className="App">
      <header className="App-header">
      <h1>Transcription</h1>
      </header>
      <ReactTooltip />
      <section>
      {diff.map((part:any) => {
        const color = part.added ? "green" : part.removed ? "red" : "grey";
        return <span style={{ color }}>{part.value}</span>;
      })}
      <div></div>
      {render}
      </section>     
    </div>
  );
}

function getTranscription(TranscribedText:TranscriptionItem[]){
  let renderText:any[]=[];

  const size = 15;
  let sentences = [];
  for (let index = 0; index < TranscribedText.length; index=index+size) {
    sentences.push(TranscribedText.slice(index,index+size));
  }

  sentences.forEach(sentence => {

    // Don't start sentences with punctuation marks.
    if (sentence[0].type == "punctuation")
    {
      renderText.push(sentence[0].alternatives[0].content)
      renderText.push(<div></div>)
      sentence.splice(0, 1);
    }
    else
    {
      renderText.push(<div></div>)
    }
    renderText.push(<><span style={{color: 'grey'}}>{getHumanReadableTime(sentence[0].start_time)}: </span></>)
    sentence.forEach(word => {
      if(word.type == "punctuation"){
        renderText.push(word.alternatives[0].content)
        renderText.push(" ")
      } else {
        renderText.push(" ")
        renderText.push(getWord(word))
      }
    });
  });

  return renderText
}

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

function getHumanReadableTime(time:string | undefined){
  if (time == undefined){
    return "-"
  }
  const totalSeconds = parseInt(time);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const result = `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
  return result
}

function getTooltip(word:TranscriptionItem){
  const confidence = word.alternatives[0].confidence;
  const start = getHumanReadableTime(word.start_time);
  const end = getHumanReadableTime(word.end_time);
  const tooltip = `<div>Confidence: ${confidence}</div><div>Time: ${start}-${end}</div>`
  return(tooltip)
}

function getWord(word:TranscriptionItem) {
    const confidence:number = parseFloat(word.alternatives[0].confidence);
    const content = word.alternatives[0].content;

    let renderWord;
    if(confidence > 0.99) {
      renderWord = <span>{content}</span>
      return renderWord
    }
    if(confidence > 0.9) {
      renderWord = <span data-tip={getTooltip(word)} data-html={true} style={{color: '#ffe0b2'}}>{content}</span>
      return renderWord
    }
    if(confidence > 0.85) {
      renderWord = <span data-tip={getTooltip(word)} data-html={true} style={{color: '#ffb74d'}}>{content}</span>
      return renderWord
    }
    if(confidence > 0.8) {
      renderWord = <span data-tip={getTooltip(word)} data-html={true} style={{color: '#ff5722'}}>{content}</span>
      return renderWord
    }
    else
    {
      renderWord = <span data-tip={getTooltip(word)} data-html={true} style={{color: '#bf360c'}}>{content}</span>
      return renderWord
    }
}

export default App;
