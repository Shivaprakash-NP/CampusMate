# 🎓 CampusMate: The AI-Powered Academic Brain

Hi there! 👋 Welcome to the backend repository of **CampusMate**.

We've all been there: staring at a 50-page syllabus, a stack of Previous Year Questions (PYQs), and a ticking clock, wondering *where do I even start?* CampusMate isn't just another file storage app. It's an intelligent, AI-driven study companion that actively reads your syllabus, figures out what's most important, and builds a day-by-day roadmap for you to ace your exams.

This repository holds the **Spring Boot engine** that makes all that magic happen.

---

## 🧠 Under the Hood: Backend Engineering

We didn't just wrap an AI API and call it a day. We engineered a resilient, cost-effective, and highly optimized backend to handle the unpredictable nature of AI and the complexities of scheduling. Here is how we solved some of our biggest engineering challenges:

### 1. Defeating AI Hallucinations (Fail-Fast Validation)

Large Language Models are incredible, but they hallucinate dead links. It's a fact.

- **The Solution:** We built a custom `RestTemplate` validation service. Before sending any curated video or article to the student, our backend pings the URL with a strict **2-second timeout**. If the server is dead or too slow, we instantly fail-fast and generate a programmatic "Fallback Search Query" (e.g., a pre-filled YouTube search). Result? **0% dead links for the user.**

### 2. The PYQ Weighting Algorithm

Not all topics are created equal. A dumb scheduler just divides 50 topics by 10 days.

- **The Solution:** Our engine actually reads the student's uploaded PYQs (Previous Year Questions), runs a text-frequency analysis against the syllabus subtopics, and assigns a **weightage** to every concept. High-yield topics get prioritized, and "Revision Days" are algorithmically locked to the final days of the schedule.

### 3. Beating the N+1 Query Nightmare

Our frontend features a beautiful, drag-and-drop calendar UI. But dragging 20 topics across different days could trigger 20 separate database `UPDATE` calls, crashing performance.

- **The Solution:** We optimized complex calendar mutations using **O(1) in-memory HashMap lookups**. When the frontend sends a deeply nested schedule update, we fetch the original JPA entities once, map them in memory, cleanly update the sequence orders and foreign keys, and let Hibernate execute a highly-efficient batch update.

### 4. Zero Redundancy (Saving API Costs)

If 500 students in the same Computer Science class upload the exact same "Data Structures" syllabus, sending it to the Gemini API 500 times is a massive waste of time and money.

- **The Solution:** Every uploaded document is hashed using **SHA-256**. If a matching hash exists in the database, we instantly deep-clone the JPA entity relationships to the new user. AI API costs and latency are reduced by **100% on duplicate uploads**.

### 5. Invisible Security

We wanted a seamless login experience without sacrificing security.

- **The Solution:** We implemented stateless JWT authentication, but instead of leaving tokens exposed in `localStorage`, we securely inject them into **HttpOnly cookies**. The frontend never sees the token, neutralizing Cross-Site Scripting (XSS) vulnerabilities.

---

## 🛠️ The Tech Stack

| Layer | Technology |
|---|---|
| Core | Java 17+, Spring Boot 3.x |
| Database | PostgreSQL, Spring Data JPA, Hibernate |
| AI Integration | Spring AI (Google Gemini API) |
| Document Parsing | Apache PDFBox |
| Security | Spring Security, JWT (HttpOnly Cookies) |
| Build Tool | Maven |

---

## 📂 Architecture Walkthrough

Curious where everything lives? Dive into `src/main/java/com/collegemate/collegemate/`:

```text
├── auth/          # JWT generation, HttpOnly cookie injection, and auth endpoints
├── Chat/          # Context-aware Gemini chatbot (knows which subtopic you're studying!)
├── schedule/      # The algorithmic brain: PYQ weighting and O(1) drag-and-drop updates
├── syllabus/      # PDF extraction, SHA-256 deduplication, and fail-fast URL validation
├── topic/         # Hierarchical entity mapping and dynamic progress calculations
└── resource/      # Curated web resources (Videos, Articles)
```

---

## 🚀 Let's Get It Running

Want to spin this up locally? It's super easy.

### Prerequisites

- Java 17+ installed
- A running PostgreSQL instance
- A Google Gemini API Key

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/CampusMate.git
cd CampusMate/backend
```

### 2. Set up your environment

Create an `application.properties` (or `.yml`) in `src/main/resources/`. Here is the blueprint you need:

```properties
# Database connection
spring.datasource.url=jdbc:postgresql://localhost:5432/campusmate
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# Your Google Gemini AI Key
spring.ai.vertex.ai.gemini.api-key=your_gemini_api_key

# JWT Security
jwt.secret=your_super_secret_jwt_key_here
jwt.expiration=86400000

# File Upload Limits (Because syllabuses can be heavy!)
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

### 3. Build & Run

We use Maven wrapper, so no need to install Maven globally!

```bash
./mvnw clean install
./mvnw spring-boot:run
```

Boom! 💥 The backend is now alive and listening on `http://localhost:8080`.

---

## 🛡️ A Quick Tip on Testing (Postman/Insomnia)

Because we use **HttpOnly cookies** for ultimate security, your API client won't automatically attach the JWT as a Bearer token. Make sure you have **cookie tracking enabled** in Postman/Insomnia so that after you hit `/auth/login`, your subsequent requests are authenticated automatically — just like a real browser!

---

Built with ❤️ (and a lot of coffee) to make studying a little less terrible.
