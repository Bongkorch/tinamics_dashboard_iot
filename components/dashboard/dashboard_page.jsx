// pages/dashboard.js (or app/dashboard/page.js for App Router)
// Just copy this entire file into your Next.js project

'use client'; // If using App Router

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, getDoc, query, orderBy, limit, updateDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [email, setEmail] = useState('your-email@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [updateValues, setUpdateValues] = useState({});

  // ════════════════════════════════════════════════════════════════
  // CHECK IF USER IS LOGGED IN
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadRooms();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ════════════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════════════
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // LOGOUT
  // ════════════════════════════════════════════════════════════════
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRooms([]);
    } catch (err) {
      setError(err.message);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // LOAD ALL ROOMS FROM FIRESTORE
  // ════════════════════════════════════════════════════════════════
  const loadRooms = async () => {
    setLoading(true);
    try {
      const plantsRef = collection(db, 'plants');
      const plantsSnap = await getDocs(plantsRef);

      const allRooms = [];

      for (const plantDoc of plantsSnap.docs) {
        const plantId = plantDoc.id;

        // Get all rooms in this plant
        const roomsRef = collection(db, 'plants', plantId, 'rooms');
        const roomsSnap = await getDocs(roomsRef);

        for (const roomDoc of roomsSnap.docs) {
          const roomId = roomDoc.id;
          const roomData = roomDoc.data();

          // Get latest reading from history
          let latestReading = roomData;
          try {
            const readingsRef = collection(db, 'plants', plantId, 'rooms', roomId, 'readings');
            const q = query(readingsRef, orderBy('ts', 'desc'), limit(1));
            const readingsSnap = await getDocs(q);

            if (readingsSnap.docs.length > 0) {
              latestReading = readingsSnap.docs[0].data();
            }
          } catch (err) {
            console.log('No readings found for', roomId);
          }

          allRooms.push({
            plantId,
            roomId,
            ...latestReading,
            timestamp: latestReading.updatedAt || latestReading.ts || new Date().toISOString(),
          });
        }
      }

      setRooms(allRooms);
    } catch (err) {
      setError('Error loading rooms: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // UPDATE ROOM DATA
  // ════════════════════════════════════════════════════════════════
  const handleUpdate = async (plantId, roomId) => {
    const key = `${plantId}-${roomId}`;
    const newTemp = parseFloat(updateValues[key]);

    if (isNaN(newTemp)) {
      alert('Enter a valid temperature');
      return;
    }

    try {
      const roomRef = doc(db, 'plants', plantId, 'rooms', roomId);
      await updateDoc(roomRef, {
        temp: newTemp,
        updatedAt: new Date().toISOString(),
      });

      // Clear input and reload
      setUpdateValues({ ...updateValues, [key]: '' });
      loadRooms();
      alert('✓ Updated successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER LOGIN PAGE
  // ════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h1 style={styles.title}>🌱 Plant Monitoring</h1>
          <p style={styles.subtitle}>Login to your account</p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {error && <div style={styles.error}>{error}</div>}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER DASHBOARD PAGE
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🌱 Plant Monitoring Dashboard</h1>
        <div style={styles.userInfo}>
          <span>{user.email}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={loadRooms} disabled={loading} style={styles.refreshBtn}>
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      {rooms.length === 0 && !loading && (
        <div style={styles.empty}>No rooms found. Create one in Firebase console.</div>
      )}

      <div style={styles.grid}>
        {rooms.map((room) => (
          <div key={`${room.plantId}-${room.roomId}`} style={styles.card}>
            <h2 style={styles.cardTitle}>
              🌿 {room.plantId} - Room {room.roomId}
            </h2>

            <div style={styles.dataRow}>
              <span>Temperature:</span>
              <span style={styles.value}>{(room.temp || 0).toFixed(1)}°C</span>
            </div>

            <div style={styles.dataRow}>
              <span>Humidity:</span>
              <span style={styles.value}>{(room.humi || 0).toFixed(1)}%</span>
            </div>

            <div style={styles.dataRow}>
              <span>PM2.5:</span>
              <span style={styles.value}>{(room.pm25 || 0).toFixed(1)} µg/m³</span>
            </div>

            <div style={styles.dataRow}>
              <span>Sensor ID:</span>
              <span style={styles.value}>{room.sensorId || 'N/A'}</span>
            </div>

            <div style={styles.timestamp}>
              Last update: {new Date(room.timestamp).toLocaleString()}
            </div>

            <div style={styles.inputGroup}>
              <input
                type="number"
                placeholder="New temperature"
                step="0.1"
                value={updateValues[`${room.plantId}-${room.roomId}`] || ''}
                onChange={(e) =>
                  setUpdateValues({
                    ...updateValues,
                    [`${room.plantId}-${room.roomId}`]: e.target.value,
                  })
                }
                style={styles.updateInput}
              />
              <button
                onClick={() => handleUpdate(room.plantId, room.roomId)}
                style={styles.updateBtn}
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    color: 'white',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '2.5em',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.2em',
    color: '#999',
    marginTop: '10px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: 'white',
  },
  loginBox: {
    maxWidth: '400px',
    margin: '100px auto',
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1em',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    margin: '20px 0 10px 0',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  logoutBtn: {
    padding: '8px 15px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  controls: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  refreshBtn: {
    padding: '10px 20px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
    maxWidth: '1200px',
    margin: '0 auto 20px',
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    color: '#667eea',
    marginBottom: '15px',
    marginTop: 0,
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    background: '#f5f5f5',
    borderRadius: '5px',
    margin: '8px 0',
  },
  value: {
    fontWeight: 'bold',
    color: '#764ba2',
  },
  timestamp: {
    fontSize: '0.85em',
    color: '#999',
    marginTop: '10px',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  updateInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '0.95em',
  },
  updateBtn: {
    padding: '8px 15px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '15px',
    background: '#f44336',
    color: 'white',
    borderRadius: '5px',
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    color: 'white',
    padding: '40px',
    fontSize: '1.1em',
  },
};
