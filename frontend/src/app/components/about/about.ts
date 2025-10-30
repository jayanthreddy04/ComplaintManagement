import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="about-container">
      <header class="hero-section">
        <h1>College Complaint Portal</h1>
        <p>A centralized platform for students to voice their concerns and get timely resolutions</p>
        <button class="get-started-btn" routerLink="/login">Get Started</button>
      </header>

      <section class="features-section">
        <div class="feature-card">
          <h3>Quick Complaint Registration</h3>
          <p>Easily submit complaints with categories like Hostel, Mess, Classroom, and more</p>
        </div>
        <div class="feature-card">
          <h3>Real-time Tracking</h3>
          <p>Track your complaint status from submission to resolution</p>
        </div>
        <div class="feature-card">
          <h3>Secure Platform</h3>
          <p>Your identity is protected with college email verification</p>
        </div>
      </section>

      <section class="how-it-works">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step">
            <span class="step-number">1</span>
            <p>Login with your college email</p>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <p>Submit your complaint with details</p>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <p>Track status updates from staff</p>
          </div>
          <div class="step">
            <span class="step-number">4</span>
            <p>Provide feedback after resolution</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-container {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .hero-section {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      margin-bottom: 40px;
    }

    .hero-section h1 {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .hero-section p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }

    .get-started-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 15px 30px;
      font-size: 1.1rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.3s ease;
    }

    .get-started-btn:hover {
      transform: translateY(-2px);
    }

    .features-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 60px 0;
    }

    .feature-card {
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-card h3 {
      color: #333;
      margin-bottom: 15px;
    }

    .how-it-works {
      text-align: center;
      margin: 60px 0;
    }

    .how-it-works h2 {
      color: #333;
      margin-bottom: 40px;
      font-size: 2.5rem;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .step {
      padding: 20px;
    }

    .step-number {
      display: inline-block;
      width: 50px;
      height: 50px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      line-height: 50px;
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 15px;
    }
  `]
})
export class AboutComponent {}