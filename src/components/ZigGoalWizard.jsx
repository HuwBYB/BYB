import React, { useState, useEffect } from "react";
import ZigQuotes from "./ZigQuotes";
import { saveGoalToDatabase } from "../utils/saveGoalToDatabase";
import { addTasksToTodo } from "../utils/addTasksToTodo";
import AlfredSpeechBubble from "./AlfredSpeechBubble";

export default function ZigGoalWizard({ userId, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quote, setQuote] = useState("");
  const [goalData, setGoalData] = useState({
    bigGoal: "",
    timeframe: "",
    yearlyMilestones: [],
    monthlyActions: [],
    weeklyActions: [],
    dailyActions: []
  });
  const [showAlfred, setShowAlfred] = useState(false);

  // Pick random Zig Ziglar quote on load
  useEffect(() => {
    const randomQuote = ZigQuotes[Math.floor(Math.random() * ZigQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleChange = (field, value) => {
    setGoalData(prev => ({ ...prev, [field]: value }));
  };

  const handleListChange = (field, index, value) => {
    setGoalData(prev => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field) => {
    setGoalData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleFinish = async () => {
    await saveGoalToDatabase(userId, goalData);
    await addTasksToTodo(userId, goalData.dailyActions, goalData.weeklyActions);
    setShowAlfred(true);
    setTimeout(() => {
      setShowAlfred(false);
      onClose();
    }, 4000);
  };

  // Steps UI
  const steps = [
    // Step 1
    <div>
      <h2>What’s your BIG goal?</h2>
      <input
        type="text"
        value={goalData.bigGoal}
        onChange={(e) => handleChange("bigGoal", e.target.value)}
        placeholder="E.g. Write a bestselling book"
        className="input"
      />
      <button onClick={nextStep} disabled={!goalData.bigGoal}>Next</button>
    </div>,
    // Step 2
    <div>
      <h2>How long will it take?</h2>
      <select
        value={goalData.timeframe}
        onChange={(e) => handleChange("timeframe", e.target.value)}
      >
        <option value="">Select timeframe</option>
        <option value="6 months">6 months</option>
        <option value="1 year">1 year</option>
        <option value="2 years">2 years</option>
        <option value="3 years">3 years</option>
        <option value="4 years">4 years</option>
        <option value="5 years">5 years</option>
      </select>
      <div>
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep} disabled={!goalData.timeframe}>Next</button>
      </div>
    </div>,
    // Step 3 - Yearly
    <div>
      <h2>Yearly milestones</h2>
      {goalData.yearlyMilestones.map((m, i) => (
        <input
          key={i}
          type="text"
          value={m}
          onChange={(e) => handleListChange("yearlyMilestones", i, e.target.value)}
          placeholder={`Milestone ${i + 1}`}
          className="input"
        />
      ))}
      <button onClick={() => addListItem("yearlyMilestones")}>+ Add Milestone</button>
      <div>
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep}>Next</button>
      </div>
    </div>,
    // Step 4 - Monthly
    <div>
      <h2>Monthly actions</h2>
      {goalData.monthlyActions.map((m, i) => (
        <input
          key={i}
          type="text"
          value={m}
          onChange={(e) => handleListChange("monthlyActions", i, e.target.value)}
          placeholder={`Monthly Action ${i + 1}`}
          className="input"
        />
      ))}
      <button onClick={() => addListItem("monthlyActions")}>+ Add Action</button>
      <div>
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep}>Next</button>
      </div>
    </div>,
    // Step 5 - Weekly
    <div>
      <h2>Weekly actions</h2>
      {goalData.weeklyActions.map((m, i) => (
        <input
          key={i}
          type="text"
          value={m}
          onChange={(e) => handleListChange("weeklyActions", i, e.target.value)}
          placeholder={`Weekly Action ${i + 1}`}
          className="input"
        />
      ))}
      <button onClick={() => addListItem("weeklyActions")}>+ Add Action</button>
      <div>
        <button onClick={prevStep}>Back</button>
        <button onClick={nextStep}>Next</button>
      </div>
    </div>,
    // Step 6 - Daily
    <div>
      <h2>Daily actions</h2>
      {goalData.dailyActions.map((m, i) => (
        <input
          key={i}
          type="text"
          value={m}
          onChange={(e) => handleListChange("dailyActions", i, e.target.value)}
          placeholder={`Daily Action ${i + 1}`}
          className="input"
        />
      ))}
      <button onClick={() => addListItem("dailyActions")}>+ Add Action</button>
      <div>
        <button onClick={prevStep}>Back</button>
        <button onClick={handleFinish}>Finish</button>
      </div>
    </div>
  ];

  return (
    <div className="zig-goal-wizard">
      <div className="zig-quote">💬 {quote}</div>
      {steps[currentStep]}
      {showAlfred && <AlfredSpeechBubble message="Outstanding, sir! Your goal has been mapped and tasks have been scheduled." />}
    </div>
  );
}
