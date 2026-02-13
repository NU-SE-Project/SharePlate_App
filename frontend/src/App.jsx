import "./App.css";

function App() {
  return (
    <>
      <div className="bg-primary p-6 rounded-md shadow">
        <h2 className="text-accent font-bold text-2xl">
          Welcome to SharePlate
        </h2>
        <p className="text-accent mt-2">Enjoy sharing meals with friends.</p>
      </div>
      <button className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary-dark transition">
        Order Now
      </button>
      <p className="text-error">Something went wrong</p>
    </>
  );
}

export default App;
