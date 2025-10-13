import './styles.css';

export default function Login({ setUserId }) {
    function submit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const userId = formData.get('username');

        setUserId(userId);
    }

    return (
        <div className="login-wrapper">
            <form
                onSubmit={submit}
                className="login-form"
            >
                <input className="login-input" name="username" />
                <button className="login-btn" type="submit">Login</button>
            </form>
        </div>
    )
}