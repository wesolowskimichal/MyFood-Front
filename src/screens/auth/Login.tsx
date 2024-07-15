import { useState } from "react"
import { useDispatch } from "react-redux"

const Login = () => {
    const dispatch = useDispatch()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>('')

    
}