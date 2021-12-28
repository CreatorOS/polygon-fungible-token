
import './App.css';
import Header from './components/TokenInfo/Header';
import GetBalance from './components/TokenInfo/GetBalance';
import BuyForm from './components/PersonalPanel/BuyForm';
import TransferForm from './components/PersonalPanel/TransferForm';
function App() {
  return (
    <div className="App">
      <Header/>
     <GetBalance/>
     <div>Wanna transfer?</div>
     <TransferForm/>
     <div>Wanna buy?</div>
     <BuyForm/>
    </div>
  );
}

export default App;
