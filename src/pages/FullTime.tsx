const FullTime = () => {
  return (
    <div className="h-full space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Full-Time Positions</h1>
        <p className="text-academy-grey text-lg">
          Explore full-time opportunities and graduate programmes.
        </p>
      </div>
      
      <div className="h-[calc(100vh-200px)] w-full">
        <iframe
          src="https://app.the-trackr.com/na-finance/full-time-programmes"
          className="w-full h-full border border-academy-grey-light rounded-lg"
          title="Full-Time Programmes"
        />
      </div>
    </div>
  );
};

export default FullTime;