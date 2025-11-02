import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FHOST } from "../constants/Functions.jsx";

const ParentFeedback = ({ parentId, students }) => {
  const [activeStudentId, setActiveStudentId] = useState("");
  const [notes, setNotes] = useState([]); // teacher -> parent notes
  const [messages, setMessages] = useState([]); // chat thread
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const studentOptions = useMemo(() => (
    (students || []).map(s => ({ id: s.id, name: s.full_name }))
  ), [students]);

  useEffect(() => {
    if (studentOptions.length > 0 && !activeStudentId) {
      setActiveStudentId(String(studentOptions[0].id));
    }
  }, [studentOptions, activeStudentId]);

  const fetchNotes = async () => {
    if (!activeStudentId) return;
    setLoading(true);
    try {
      // Backend endpoint to implement: GET /feedback/notes?student_id=...&parent_id=...
      const res = await axios.get(`${FHOST}/feedback/notes`, {
        params: { student_id: activeStudentId, parent_id: parentId }
      });
      setNotes(Array.isArray(res.data?.notes) ? res.data.notes : []);
    } catch (e) {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeStudentId) return;
    try {
      // Backend endpoint to implement: GET /feedback/messages?student_id=...&parent_id=...
      const res = await axios.get(`${FHOST}/feedback/messages`, {
        params: { student_id: activeStudentId, parent_id: parentId }
      });
      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
    } catch (e) {
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudentId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeStudentId) return;
    const payload = {
      parent_id: parentId,
      student_id: Number(activeStudentId),
      text: newMessage.trim()
    };
    try {
      // Backend endpoint to implement: POST /feedback/messages
      const res = await axios.post(`${FHOST}/feedback/messages`, payload);
      if (res.status >= 200 && res.status < 300) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Feedback</h2>
        <select
          value={activeStudentId}
          onChange={(e) => setActiveStudentId(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-800"
        >
          {studentOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Notes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-600">Teacher Notes</h3>
            <button
              onClick={fetchNotes}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="text-gray-500">No notes yet.</div>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">{n.teacher_name || 'Teacher'}</h4>
                    <span className="text-xs text-gray-500">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-gray-700 text-sm mt-2">{n.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-600">Chat</h3>
            <button
              onClick={fetchMessages}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[40vh]">
            {messages.length === 0 ? (
              <div className="text-gray-500">No messages yet.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`p-3 rounded-lg ${m.sender === 'parent' ? 'bg-blue-50 border border-blue-200 self-end' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="text-xs text-gray-500 mb-1">{m.sender}</div>
                  <div className="text-gray-800 text-sm">{m.text}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentFeedback;


