import { Link } from 'react-router-dom';

// Internal paths use the router; everything else is a normal anchor.
export default function A({ href = '', children, ...rest }) {
  return href.startsWith('/') ? <Link to={href} {...rest}>{children}</Link> : <a href={href} {...rest}>{children}</a>;
}
