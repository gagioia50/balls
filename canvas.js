function startCanvas(n, r, v) {

		var numberParticles = parseInt(n);
		localStorage.setItem("nPart", numberParticles);
		var radiusParticles = parseInt(r);
		localStorage.setItem("rPart", radiusParticles);
		var velocityParticles = parseInt(v);
		localStorage.setItem("vPart", velocityParticles);
		
		var canvas = document.querySelector('canvas');
		var c = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.documentElement.style.overflow = 'hidden';

		function VelocityAfter(v1x, v1y, v2x, v2y, alpha) {
			
			var v1s = v1x * Math.cos(alpha) + v1y * Math.sin(alpha);
			var v1t = -v1x * Math.sin(alpha) + v1y * Math.cos(alpha);

			var v2s = v2x * Math.cos(alpha) + v2y * Math.sin(alpha);
			var v2t = -v2x * Math.sin(alpha) + v2y * Math.cos(alpha);

			var v1sAfter = v2s;
			var v1tAfter = v1t;

			var v2sAfter = v1s;
			var v2tAfter = v2t;

			this.v1xAfter = v1sAfter*Math.cos(alpha) - v1tAfter*Math.sin(alpha);
			this.v1yAfter = v1sAfter*Math.sin(alpha) + v1tAfter*Math.cos(alpha);

			this.v2xAfter = v2sAfter*Math.cos(alpha) - v2tAfter*Math.sin(alpha);
			this.v2yAfter = v2sAfter*Math.sin(alpha) + v2tAfter*Math.cos(alpha);
		}

		function Distance(x1, y1, x2, y2) {
			const xDist = x2 - x1;
			const yDist = y2 - y1;
			return Math.sqrt(Math.pow(xDist,2)+Math.pow(yDist,2));
		}

		function RandomIntFromRange(min, max) {
			return Math.floor(Math.random()*(max-min+1)+min);
		}

		function Particle(x, y, radius, color) {
			this.x = x;
			this.y = y;
			
			this.velocity = {
				vx: (Math.random() - 0.5) * velocityParticles,
				vy: (Math.random() - 0.5) * velocityParticles
			};
			
			this.radius = radius;
			this.color = color;

			this.update = function(particles) {
				this.draw();
					
					if (this.x - this.radius <= 0) {

						this.x = this.radius + 1;

						this.velocity.vx = -this.velocity.vx;
						this.x += this.velocity.vx;
						this.y += this.velocity.vy;
					}

					if (this.x + this.radius >= innerWidth) {

						this.x = innerWidth - this.radius - 1;

						this.velocity.vx = -this.velocity.vx;
						this.x += this.velocity.vx;
						this.y += this.velocity.vy;
					}

					if (this.y - this.radius <= 0) {

						this.y = this.radius + 1;

						this.velocity.vy = -this.velocity.vy;
						this.x += this.velocity.vx;
						this.y += this.velocity.vy;
					}

					if (this.y + this.radius >= innerHeight) {

						this.y = innerHeight - this.radius - 1;

						this.velocity.vy = -this.velocity.vy;
						this.x += this.velocity.vx;
						this.y += this.velocity.vy;
					}


				for (var i = 0; i < particles.length; i++) {
					if (this === particles[i]) continue;

					if (Distance(this.x,this.y,particles[i].x, particles[i].y) - this.radius*2 <= 0 ) {
						this.collision(i);
					}
					
				}

				this.x += this.velocity.vx;
				this.y += this.velocity.vy;

			}

			this.collision = function(i) {
				alpha = Math.atan((particles[i].y - this.y) / (particles[i].x - this.x));
				var v1x = this.velocity.vx;  var v1y = this.velocity.vy;
				var v2x = particles[i].velocity.vx; var v2y = particles[i].velocity.vy;

				let dist_x = particles[i].x - this.x;
				let dist_y = particles[i].y - this.y;
				let radii_sum = particles[i].radius + this.radius;
				let length = Math.sqrt(dist_x*dist_x + dist_y*dist_y);
				let unit_x = dist_x/length;
				let unit_y = dist_y/length;
				particles[i].x = this.x + (radii_sum + 1)*unit_x;
				particles[i].y = this.y + (radii_sum + 1)*unit_y;

				velocityAfter = new VelocityAfter(v1x, v1y, v2x, v2y, alpha);

				this.velocity.vx = velocityAfter.v1xAfter;
				this.velocity.vy = velocityAfter.v1yAfter;
				particles[i].velocity.vx = velocityAfter.v2xAfter;
				particles[i].velocity.vy = velocityAfter.v2yAfter;

				this.x += this.velocity.vx;
				this.y += this.velocity.vy;
				particles[i].x += particles[i].velocity.vx;
				particles[i].y += particles[i].velocity.vy;
			}

			this.draw = function() {
				c.beginPath();
				c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
				c.fillStyle = this.color;
				c.fill();
				c.closePath();
			}
		}

		// Implementation
		let particles;
		function init() {
			particles = [];
			for (var i = 0; i < numberParticles; i++) {
				const radius = radiusParticles;
				let x = RandomIntFromRange(radius, innerWidth-radius);
				let y = RandomIntFromRange(radius, innerHeight-radius);
				var color = 'blue';
				if (i != 0) {
					for (var j = 0; j < particles.length; j++) {
						if (Distance(x,y,particles[j].x, particles[j].y) - radius*2 <= 0) {
							x = RandomIntFromRange(radius, innerWidth-radius);
							y = RandomIntFromRange(radius, innerHeight-radius);
							j = -1;
						}
					}
				}
				
				if (i == 0) {
					color = 'red';
				}

				particles.push(new Particle(x, y, radius, color));
			}
			animate();
		}

		function animate() {
			requestAnimationFrame(animate)
			c.clearRect(0, 0, innerWidth, innerHeight);
			
			for (var i = 0; i < particles.length; i++) {
				particles[i].update(particles);
			}
		}

		init();
		animate();

}