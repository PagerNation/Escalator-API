import authService from '../services/auth';

function loginUser(req, res) {
  authService.loginUser(req.body.email, req.body)
    .then(authObj => res.json(authObj))
    .catch(err => res.send(err.message));
}

function signupUser(req, res) {
  authService.signupUser(req.body)
    .then(result => res.json(result))
    .catch(err => res.send(err.message));
}

export default {
  loginUser,
  signupUser
};
