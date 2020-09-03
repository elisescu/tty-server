[![Build Status](https://travis-ci.com/elisescu/tty-server.svg?branch=master)](https://travis-ci.com/elisescu/tty-server)

# tty-server

Server side for [tty-share](https://github.com/elisescu/tty-share).


## Docker

The server can be built into a docker image as follows:

    docker build -t tty-server .

To run the container, type:

    docker run \
      -p 6543:6543 -p 5000:5000 \
      -e URL=http://localhost:5000 \
      --cap-drop=all --rm \
      tty-server

where you can replace `URL` by whatever will be the publicly visible URL of the server.

After this, clients can be connected as follows:

    tty-share -useTLS=false -server localhost:6543

In the above command, 6543 is the default port where `tty-server` listens for
incoming shares (i.e. `tty-share` clients), and 5000 is the port of the web
interface through which remote users can connect. You can override the
defaults by specifying a different port mapping on the command line, e.g.
`-p 7654:6543 -p 80:5000` to listen on `7654` and serve on `80`.


## TLS Setup

You'll need a certificate and the associed key file.
Here is an example for a setup with `nginx` as proxy

### nginx config for the web/browser side (http+websockets connection)
This section can go for example in `/etc/nginx/site-enabled/default`

    server {
        server_name _;
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;
        ssl_certificate /etc/ssl/certs/server.crt;
        ssl_certificate_key /etc/ssl/private/server.key;
        proxy_send_timeout 1600;
        proxy_read_timeout 1600;
        ########### tty-server application
        # the /s/, /ws/ and /static/ locations - all used by the actual tty-server.
        location / {
                proxy_pass              http://localhost:5000;
                proxy_redirect off;
                proxy_set_header        Host $host;
                proxy_set_header        X-Real-IP $remote_addr;
                proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header        X-Forwarded-Proto $scheme;

                # Allow websocket upgrade
                # https://iota.stackexchange.com/questions/2535/hornet-dashboard-not-working-the-client-is-not-using-the-websocket-protocol
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "Upgrade";
        }
    }

### nginx config for the tty-share command line client (TLS connection)
For the stream , you'll need the stream module from nginx. This configuration cannot go in the `site-enabled/` because it's limited to the http module and not the stream module. Store it in `/etc/nginx/modules-enabled/99-tty-server-stream.conf`, for example

    stream {
        server {
            # https://nginx.org/en/docs/stream/ngx_stream_core_module.html#server
            # the tty-server tcp connection ssl proxy
            listen 7654 ssl so_keepalive=30m::10;
            proxy_pass localhost:6543;
            ssl_certificate /etc/ssl/certs/server.crt;
            ssl_certificate_key /etc/ssl/private/server.key;
        }
    }

