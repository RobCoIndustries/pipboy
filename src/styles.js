export default {
  app: {
    display: 'block',
    height: '100%',
    width: '100%'
  },
  menuButton: {
    display: 'block',
    borderRadius: '50%',
    padding: 10,
    position: 'fixed',
    top: 10,
    left: 10,

    ':hover': {
      background: '#fff',
      boxShadow: `0 14px 28px rgba(0,0,0,0.25),
                   0 10px 10px rgba(0,0,0,0.22)`
    }
  }
}
