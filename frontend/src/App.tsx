import { useState } from 'react';
import { SignupPage } from './components/SignupPage';
import { ExamPage } from './components/ExamPage';

function App() {
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleSignupComplete = (id: string) => {
    setStudentId(id);
  };

  return (
    <>
      {!studentId ? (
        <SignupPage onSignupComplete={handleSignupComplete} />
      ) : (
        <ExamPage studentId={studentId} />
      )}
    </>
  );
}

export default App;
