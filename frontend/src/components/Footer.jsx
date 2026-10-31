import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <Link className="footer-brand" to="/">
        <span className="footer-brand-dot" aria-hidden="true" />
        screenwise
      </Link>
      <p>Technical interviews, with your potential in mind.</p>
    </footer>
  )
}

export default Footer
