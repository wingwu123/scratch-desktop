

console.info("versions", process.versions);

class ShardProcess {
	private barrier = new Barrier();
	constructor() {
		setTimeout( () => {
			console.info(" spawn ");
			this.spawn();
		}, 3000);
	}

	spawn(): void {
		this.barrier.open();
	}

	async whenReady(): Promise<void> {
		console.info("whenReady begin ");
		await this.barrier.wait();

		console.info("whenReady end ");
	}
}

let pr : ShardProcess = new ShardProcess();
pr.whenReady();



