import { useState } from 'react';
import { SignupPage } from './components/SignupPage';
import { ExamPage } from './components/ExamPage';
import { Student } from './types';

function App() {
  const [student, setStudent] = useState<Student | null>(null);

  const handleSignupComplete = (newStudent: Student) => {
    setStudent(newStudent);
  };

  return (
    <>
      {!student ? (
        <SignupPage onSignupComplete={handleSignupComplete} />
      ) : (
        <ExamPage student={student} />
      )}
    </>
  );
}

export default App;
