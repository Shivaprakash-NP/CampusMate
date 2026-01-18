import { Link } from "react-router-dom"

const Notfound = () => {
    return (
        <>
            <h1>404 not found</h1>
            <Link to={"/"}>
                <button>Back to home</button>
            </Link>
        </>
        
    )
}

export default Notfound