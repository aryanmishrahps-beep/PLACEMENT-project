import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [user, navigate]);

  return (
    <div className="landing-container">
      <style>{`
        .landing-container {
          min-height: 100vh;
          background: var(--gradient-hero);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          font-family: 'Inter', sans-serif;
        }

        /* 3D Scene Setup */
        .scene {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          perspective: 1000px;
          z-index: 10;
        }

        /* Hero Content */
        .hero-content {
          max-width: 500px;
          z-index: 20;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1.1;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .hero-title span {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .btn-get-started {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          background: var(--gradient-primary);
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 999px;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
        }

        .btn-get-started:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 40px rgba(99, 102, 241, 0.6);
        }

        /* 3D Code Window */
        .window-3d-wrapper {
          transform-style: preserve-3d;
          animation: float-3d 6s ease-in-out infinite;
          position: relative;
        }

        .window-3d {
          width: 480px;
          height: 320px;
          background: #1e1e2e;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            -20px 20px 60px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.1);
          transform: rotateX(15deg) rotateY(-20deg) rotateZ(3deg);
          transform-style: preserve-3d;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .window-3d::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(135deg, #6366f1, #10b981);
          transform: translateZ(-10px);
          opacity: 0.5;
          filter: blur(20px);
        }

        .window-header {
          height: 40px;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 8px;
        }

        .window-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
        }

        .window-body {
          padding: 24px;
          font-family: 'JetBrains Mono', monospace;
          color: #a6accd;
          font-size: 15px;
          line-height: 1.8;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .code-line {
          display: flex;
          gap: 16px;
        }

        .line-num {
          color: #4f5b66;
          user-select: none;
        }

        .code-keyword { color: #c678dd; }
        .code-func { color: #61afef; }
        .code-string { color: #98c379; }

        /* Floating syntax elements */
        .floating-element {
          position: absolute;
          background: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          color: var(--color-primary);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          transform-style: preserve-3d;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .float-1 { top: -20px; right: -30px; animation: float-1 5s ease-in-out infinite 0.5s; }
        .float-2 { bottom: 40px; left: -40px; animation: float-2 7s ease-in-out infinite; }

        @keyframes float-3d {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-15px) rotateX(2deg); }
        }

        @keyframes float-1 {
          0%, 100% { transform: translateZ(40px) translateY(0); }
          50% { transform: translateZ(60px) translateY(-10px); }
        }

        @keyframes float-2 {
          0%, 100% { transform: translateZ(30px) translateY(0); }
          50% { transform: translateZ(50px) translateY(10px); }
        }

        /* Abstract shapes */
        .shape {
          position: absolute;
          filter: blur(60px);
          z-index: 1;
          opacity: 0.6;
        }
        
        .shape-1 {
          top: -10%; left: -10%;
          width: 50vw; height: 50vw;
          background: rgba(99, 102, 241, 0.3);
          border-radius: 50%;
        }

        .shape-2 {
          bottom: -20%; right: -10%;
          width: 60vw; height: 60vw;
          background: rgba(16, 185, 129, 0.2);
          border-radius: 50%;
        }
      `}</style>

      {/* Background Shapes */}
      <div className="shape shape-1" />
      <div className="shape shape-2" />

      <div className="scene">
        {/* Left Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            Master your <br />
            <span>Coding Skills.</span>
          </h1>
          <p className="hero-desc">
            The ultimate placement training portal. Practice algorithms, ace mock interviews, and build your technical profile to land your dream job.
          </p>
          <button className="btn-get-started" onClick={() => navigate('/login')}>
            Get Started 🚀
          </button>
        </div>

        {/* Right 3D Visual */}
        <div className="window-3d-wrapper">
          <div className="window-3d">
            <div className="window-header">
              <div className="window-dot" style={{ background: '#ff5f56' }} />
              <div className="window-dot" style={{ background: '#ffbd2e' }} />
              <div className="window-dot" style={{ background: '#27c93f' }} />
            </div>
            <div className="window-body">
              <div className="code-line">
                <span className="line-num">1</span>
                <span><span className="code-keyword">const</span> placement = <span className="code-keyword">new</span> <span className="code-func">Journey</span>();</span>
              </div>
              <div className="code-line">
                <span className="line-num">2</span>
                <span>placement.<span className="code-func">prepare</span>(<span className="code-string">"DSA"</span>);</span>
              </div>
              <div className="code-line">
                <span className="line-num">3</span>
                <span>placement.<span className="code-func">buildProjects</span>();</span>
              </div>
              <div className="code-line">
                <span className="line-num">4</span>
                <span> </span>
              </div>
              <div className="code-line">
                <span className="line-num">5</span>
                <span><span className="code-keyword">if</span> (skills.<span className="code-func">isReady</span>()) {`{`}</span>
              </div>
              <div className="code-line">
                <span className="line-num">6</span>
                <span>&nbsp;&nbsp;<span className="code-keyword">return</span> <span className="code-string">"Dream Job Acquired 🎯"</span>;</span>
              </div>
              <div className="code-line">
                <span className="line-num">7</span>
                <span>{`}`}</span>
              </div>
            </div>

            {/* Floating Badges outside the window */}
            <div className="floating-element float-1">{'<React />'}</div>
            <div className="floating-element float-2">{'O(log n)'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
