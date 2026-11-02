VELQOR MARKETS - DEMO PROJECT

This starter provides a small server-backed demo trading terminal.
Quotes are simulated on the server; they are NOT live prices.
Virtual demo positions, close execution, floating P/L, SL/TP auto close,
history and account credit/reset are server endpoints.

Run (requires Node.js 18+ and internet for npm install):
  npm install
  npm start
Then open http://localhost:3000

Endpoints:
GET /api/health
GET /api/quotes
GET /api/account
GET /api/positions
GET /api/history
POST /api/orders {symbol,side,lots,sl?,tp?}
POST /api/positions/:id/close
POST /api/account/credit
POST /api/account/reset

IMPORTANT:
- No live market feed, broker connectivity, authentication, database, chat agent,
  funding/withdrawal or real-money execution.
- Memory state resets when server restarts.
- Do not expose this demo publicly as a real broker or solicit customer funds.
- Production requires a licensed/contracted broker or white-label provider,
  real quote feed with redistribution rights, secure auth/KYC/AML, persistent DB,
  risk/margin engine, operational monitoring and legal/regulatory review.
