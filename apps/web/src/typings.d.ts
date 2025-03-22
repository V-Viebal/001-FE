/* SystemJS module definition */
declare let module: NodeModule;
interface NodeModule { id: string }

declare var $: any;
declare var jQuery: any;

interface Window {
	Webflow: any;
	tram: any;
}
