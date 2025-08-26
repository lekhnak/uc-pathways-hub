const SummerInternships = () => {
  return (
    <div className="h-full space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Summer Internships</h1>
        <p className="text-academy-grey text-lg">
          Browse summer internship opportunities in finance.
        </p>
      </div>
      
      <div className="h-[calc(100vh-200px)] w-full">
        <iframe
          src="https://app.the-trackr.com/na-finance/summer-internships"
          className="w-full h-full border border-academy-grey-light rounded-lg"
          title="Summer Internships"
        />
      </div>
    </div>
  );
};

export default SummerInternships;