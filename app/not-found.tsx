import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div id="notfound">
        <div className="notfound">
          <div className="notfound-404">
            <h1>404</h1>
            <h2>Page not found</h2>
          </div>
          <Link href="/">Return Home</Link>
        </div>
      </div>
    </div>
  );
}
