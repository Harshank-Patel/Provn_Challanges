# Provn Challenge

AI-powered public spending analytics platform built with MongoDB Atlas, FastAPI, OpenAI GPT-5, and React.

## Overview (AI generated)

Provn Challenge enables users to explore large government spending datasets using natural language.
Instead of writing SQL queries or manually filtering data, users can simply ask questions such as:
- Largest agencies
- Top vendors for Commerce
- Show transportation spending by category
- Which vendors receive the most money?

The application translates natural-language questions into structured analytics queries, executes those queries against a MongoDB dataset, and presents the results through interactive visualizations and dashboards.

## Three things: (in your own words):

1. The problem you set out to solve — what is the specific user pain you're addressing, and why did you choose this direction over the other directions you could have taken?

Answer: So I noticed this was an issue while working at Meta, where we see that even experienced Devs were struggling to find the right key to query for logs and other metrics, and the solution was simple. We want to offload the complex task of writing queries to AI. I initially explored the path where we use drag and drop to build queries but that is extremly complex and still requires some CS skills. And for the target audiance of non-technical user, this would be still complex. So here I connected the ChatGPT/Open-AI to backend to help me write the SQL queries which will then be called to return data to user and displayed in chart/table format.

2. The tech and architectural choices you made — what did you build, how does it work, what did you explicitly defer, and what would you change in a production version?

Answer: I used FastAPI for backend because the application is analytics-driven rather than entity-driven since main interaction was natural language question. so Rest-endpoints along with GPT-generated queries. I also considered using GraphQL for this project. But the front-end was easier in React so I opted for it.

3. Your AI usage log — for each significant AI interaction during the challenge, briefly note: what you asked, what it gave you, and what you kept, changed, or rejected. Three interactions is sufficient. This is not a trick — we want to see how you work with AI, not whether you used it.

Answer: I asked AI to write a prompt that would translate user questions into a structured QuerySpec JSON format for MongoDB aggregation queries. It also suggested validation rules and example question-to-query mappings. And then with the healp of AI, I built the UI using React dashboard, including summary cards, charts, and result tables. And finally, the AI suggested a summary table for user to be easier understand the query results so therefore I did that too. 