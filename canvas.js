function startCanvas(number, radius, vel, iter_day, heal_days, fat_days, pct_fat) {

		var numberParticles = parseInt(number);
		localStorage.setItem("nPart", numberParticles);
		var radiusParticles = parseInt(radius);
		localStorage.setItem("rPart", radiusParticles);
		var velocityParticles = parseInt(vel);
		localStorage.setItem("vPart", velocityParticles);
		var iter_day = parseInt(iter_day);
		localStorage.setItem("iter_day", iter_day);
		var heal_days = parseInt(heal_days);
		localStorage.setItem("heal_days", heal_days);
		var fat_days = parseInt(fat_days);
		localStorage.setItem("fat_days", fat_days);
		var pct_fat = parseInt(pct_fat);
		localStorage.setItem("pct_fat", pct_fat);


		var iterations = 0;
		var day_start_heal = 0;
		var day_start_fat = 0;
		var infected = 0;
		var fatalities = 0;
		var recovered = 0;
		var healthy = 0;
		var dead = 0;
		var x_days = [];
		var y_infected = [];
		var y_recovered = [];
		var y_healthy = [];
		var y_dead = [];
		var current_day = 0;
		
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

		function Particle(x, y, radius, color, day_start_heal, day_start_fat) {
			this.x = x;
			this.y = y;
			
			this.velocity = {
				vx: (Math.random() - 0.5) * velocityParticles,
				vy: (Math.random() - 0.5) * velocityParticles
			};
			
			this.radius = radius;
			this.color = color;
			this.day_start_heal = day_start_heal;
			this.day_start_fat = day_start_fat;

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
				if (this.color == 'red' && particles[i].color == 'blue') {
					particles[i].color = 'red';
					particles[i].day_start_heal = current_day;
				}
				if (this.color == 'blue' && particles[i].color == 'red') {
					this.color = 'red';
					this.day_start_heal = current_day;
				}
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
					day_start_heal = 1;
				}

				particles.push(new Particle(x, y, radius, color, day_start_heal, day_start_fat));
			}
			
			animate();
		}

		function animate() {
			
			c.clearRect(0, 0, innerWidth, innerHeight);
			
			for (var i = 0; i < particles.length; i++) {
				particles[i].update(particles);
			}

			if (iterations == iter_day*current_day) {
					x_days.push(current_day);
					y_infected.push(infected);
					y_recovered.push(recovered);
					y_healthy.push(healthy);
					y_dead.push(dead);
					
					var infectedArray = [];
					current_day += 1;
					infected = 0;
					recovered = 0;
					healthy = 0;
					dead = 0;
					
					for (var n=0; n<particles.length; n++) {
						day_start_heal = particles[n].day_start_heal;
						day_start_fat = particles[n].day_start_fat;
						
						if (particles[n].color == 'green') {
							recovered += 1;
						}
						if (particles[n].color == 'blue') {
							healthy += 1;
						}
						if (particles[n].color == 'red' && (day_start_heal) > 0) {
							if ((current_day - day_start_heal) > heal_days) {
								particles[n].color = 'green'
							}	
						}
						if (particles[n].color == 'red' && (day_start_fat) > 0) {
							if ((current_day - day_start_fat) > fat_days) {
								particles[n].color = 'black'
							}	
						}	
						if (particles[n].color == 'red') {
							infected += 1;
							infectedArray.push(n);
						}
						if (particles[n].color == 'black') {
							dead += 1;
						}				
					}

					fatalities = Math.round(infected * pct_fat/100);
					if (fatalities > 0) {
						var counter = 0;
						var i = 0;
						do  {
							var n = infectedArray[i];
							if (infectedArray[i].color == 'black') {
								i += 1;
								continue;
							}
							particles[n].day_start_heal = -1;
							particles[n].day_start_fat = current_day;
							counter += 1;
							i += 1;

						} while (counter <= fatalities)
					}

			}

			iterations += 1;

			if (infected > 0) {
				requestAnimationFrame(animate);
			} else {
				
				var items_inf = [];
				var items_rec = [];
				var items_hea = [];
				var items_dea = [];

				for (var i=1; i<x_days.length; i++) {
					items_inf[i] = {x: x_days[i], y: y_infected[i]};
					items_rec[i] = {x: x_days[i], y: y_recovered[i]};
					items_hea[i] = {x: x_days[i], y: y_healthy[i]};
					items_dea[i] = {x: x_days[i], y: y_dead[i]};
				}
				
				graph(items_inf, items_rec, items_hea, items_dea);
			}
			
		}

		function graph(items_inf, items_rec, items_hea, items_dea) {
			c.clearRect(0, 0, innerWidth, innerHeight);
		    var scatterChart = new Chart(c, {
		    type: 'scatter',
		    data: {
		        datasets: [{
		            label: 'Infected',
					data: items_inf,
					fill: false,
				    borderColor: 'red',
				    backgroundColor: 'transparent'
		        },
		        {
		            label: 'Recovered',
					data: items_rec,
					fill: false,
				    borderColor: 'green',
				    backgroundColor: 'transparent'
		        },
		        {
		            label: 'Healthy',
					data: items_hea,
					fill: false,
				    borderColor: 'blue',
				    backgroundColor: 'transparent'
		        },
		        {
		            label: 'Dead',
					data: items_dea,
					fill: false,
				    borderColor: 'black',
				    backgroundColor: 'transparent'
		        }]
		    },
		    options: {
		        scales: {
		            xAxes: [{
		                type: 'linear',
		                position: 'bottom'
		            }]
		        }
		    }
		});
		    return;
		}

		init();
		

}